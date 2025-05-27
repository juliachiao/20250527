const outer_data = { 
    store_name: "淡江水果店",
    store_address: "新北市淡水區某某街100號",
    fruits: [
       { name: "蘋果", price: 30, num: 10 },
       { name: "香蕉", price: 60, num: 10 },
       { name: "芭樂", price: 120, num: 10 }
    ],
    selectedFruit: null, // 選中的水果
    selectedQuantity: 0, // 選中的數量
    cart: [], // 採購清單
    totalAmount: 0, // 總金額
    showEmailInput: false, // 是否顯示 Email 輸入框
    userEmail: "" // 使用者輸入的 Email
};

const app = Vue.createApp({
   data() {
       return outer_data;
   },
   methods: {
       addToCart() {
           if (this.selectedFruit && this.selectedQuantity > 0) {
               const totalPrice = this.selectedFruit.price * this.selectedQuantity;

               // 將選擇的水果加入採購清單
               this.cart.push({
                   name: this.selectedFruit.name,
                   price: this.selectedFruit.price,
                   quantity: this.selectedQuantity,
                   totalPrice: totalPrice
               });

               // 更新總金額
               this.totalAmount += totalPrice;

               // 減少水果庫存
               this.selectedFruit.num -= this.selectedQuantity;

               // 重置選擇數量
               this.selectedQuantity = 0;
           }
       },
       removeFromCart(index) {
           const item = this.cart[index];

           // 將刪除的水果數量加回庫存
           const fruit = this.fruits.find(f => f.name === item.name);
           if (fruit) {
               fruit.num += item.quantity;
           }

           // 更新總金額
           this.totalAmount -= item.totalPrice;

           // 刪除該筆資料
           this.cart.splice(index, 1);
       },
       checkout() {
           // 顯示 Email 輸入框
           this.showEmailInput = true;
       },
      // ...existing code...
       sendEmail() {
           if (!this.userEmail) {
               alert("請輸入有效的 Email！");
               return;
           }

           // 模擬寄送信件
           const emailContent = `
               寄信者: 088775@o365.tku.edu.tw
               收信者: ${this.userEmail}
               
               感謝您的購買！
               採購清單：
               ${this.cart.map(item => `${item.name} - 數量: ${item.quantity} - 金額: ${item.totalPrice}元`).join("\n")}
               總金額: ${this.totalAmount} 元
               匯款帳號: 123456789
           `;
           console.log(`寄送至: ${this.userEmail}\n內容:\n${emailContent}`);
           alert("信件已寄出！");

           // 下載 Excel
           this.downloadExcel();

           // 重置 Email 輸入框
           this.showEmailInput = false;
           this.userEmail = "";
       },
       downloadExcel() {
           // 準備資料
           const ws_data = [
               ["水果名稱", "單價", "數量", "金額"]
           ];
           this.cart.forEach(item => {
               ws_data.push([item.name, item.price, item.quantity, item.totalPrice]);
           });
           ws_data.push(["", "", "總金額", this.totalAmount]);

           // 建立工作表與活頁簿
           const ws = XLSX.utils.aoa_to_sheet(ws_data);
           const wb = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(wb, ws, "採購清單");

           // 下載 Excel 檔案
           XLSX.writeFile(wb, "採購清單.xlsx");
       }
       
// ...existing code...

   }
});

app.mount("#app1");