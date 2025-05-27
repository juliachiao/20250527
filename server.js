const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // 加入這一行

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // 這一行讓你可以直接用 localhost:3000 開網頁

// 儲存帳單並更新庫存
app.post('/save-excel', (req, res) => {
    const { cart, totalAmount, userEmail } = req.body;

    // 1. 寫入帳單 Excel
    const ws_data = [
        ["Email", "水果名稱", "單價", "數量"]
    ];
    cart.forEach(item => {
        ws_data.push([userEmail, item.name, item.price, item.quantity]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "採購清單");
    const billPath = path.join(__dirname, '採購清單.xlsx');
    XLSX.writeFile(wb, billPath);

    // 2. 更新庫存 Excel
    const stockPath = path.join(__dirname, '庫存.xlsx');
    if (fs.existsSync(stockPath)) {
        const stockWb = XLSX.readFile(stockPath);
        const stockWs = stockWb.Sheets[stockWb.SheetNames[0]];
        const stockData = XLSX.utils.sheet_to_json(stockWs);

        // 扣除購買數量
        cart.forEach(item => {
            const stockItem = stockData.find(row => row['水果名稱'] === item.name);
            if (stockItem) {
                stockItem['數量'] = Math.max(0, (stockItem['數量'] || 0) - item.quantity);
            }
        });

        // 轉回 worksheet 並寫回檔案
        const newStockWs = XLSX.utils.json_to_sheet(stockData, { header: ["水果名稱", "數量", "單價"] });
        stockWb.Sheets[stockWb.SheetNames[0]] = newStockWs;
        XLSX.writeFile(stockWb, stockPath);
    }

    res.json({ success: true, message: 'Excel 檔案已儲存，庫存已更新' });
});

// 查詢庫存
app.get('/get-stock', (req, res) => {
    const filePath = path.join(__dirname, '庫存.xlsx');
    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    // 轉換為前端需要的格式
    const fruits = data.map(row => ({
        name: row['水果名稱'],
        num: row['數量'],
        price: row['單價']
    }));
    res.json(fruits);
});

// 根目錄提示
app.get('/', (req, res) => {
    res.send('伺服器運作中，請透過前端頁面進行操作。');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

