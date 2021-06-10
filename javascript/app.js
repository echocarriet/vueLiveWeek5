import productModal from './productModal.js';
//VeeValidate 表單驗證-規則
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
//VeeValidate 表單驗證-多國語系
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const apiUrl = 'https://vue3-course-api.hexschool.io/';
const apiPath = 'carrie';

const app = Vue.createApp({
    data() {
        return {
            loadingStatus: {   //讀取效果
                loadingItem: '',
            },
            products: [], //產品列表
            product: {},  //props 傳遞到內層的暫存資料　
            form: {  //表單結構 (API結帳頁面)
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: ''
                },
                message: ''
            },
            cart: {}, //購物車列表
        }
    },
    methods: {
        getProducts() {
            const url = `${apiUrl}api/${apiPath}/products`;
            axios.get(url)
                .then((res) => {
                    if (res.data.success) {
                        console.log(res);
                        this.products = res.data.products;
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        openModal(item) {
            this.loadingStatus.loadingItem = item.id;
            const url = `${apiUrl}api/${apiPath}/product/${item.id}`;
            axios.get(url)
                .then((res) => {
                    if (res.data.success) {
                        console.log(res);
                        this.loadingStatus.loadingItem = '';
                        this.product = res.data.product;
                        this.$refs.userProductModal.openModal();
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

        },//於 qty 參數加入預設值，加入購物車按鈕沒加上 qty 參數也不會 undefined
        addCart(id, qty = 1) { //加入購物車
            this.loadingStatus.loadingItem = id;
            const url = `${apiUrl}api/${apiPath}/cart`;
            const cart = {
                product_id: id,
                qty
            }
            // console.log(cart);
            this.$refs.userProductModal.hideModal();
            axios.post(url, { data: cart })
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message);
                        this.loadingStatus.loadingItem = '';
                        this.getCart();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        getCart() { //取得購物車列表
            const url = `${apiUrl}api/${apiPath}/cart`;
            axios.get(url)
                .then((res) => {
                    if (res.data.success) {
                        this.cart = res.data.data;
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        updateCart(item) {  //更新購物車 ( 注意:裡面id為購物車id 非產品id)
            this.loadingStatus.loadingItem = item.id;
            //API參數 { "data": { "product_id":"-L9tH8jxVb2Ka_DYPwng","qty":1 } }
            const url = `${apiUrl}api/${apiPath}/cart/${item.id}`;
            const cart = {
                product_id: item.product.id,
                qty: item.qty
            }
            // console.log(cart , url);
            axios.put(url, { data: cart })
                .then((res) => {
                    if (res.data.success) {
                        // console.log(res);
                        this.loadingStatus.loadingItem = '';
                        this.getCart();
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        removeCartItem(id) { //刪除某一筆購物車資料
            this.loadingStatus.loadingItem = id;
            const url = `${apiUrl}api/${apiPath}/cart/${id}`;
            axios.delete(url)
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message);
                        this.loadingStatus.loadingItem = '';
                        this.getCart();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        deleteAllCarts() { //刪除全部購物車
            if (this.cart.carts.length === 0) {
                alert('購物車內無商品唷 !');
                return;
            }
            const url = `${apiUrl}api/${apiPath}/carts`;
            axios.delete(url)
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message);
                        this.getCart();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        createOrder() {  //結帳頁面
            if (this.cart.carts.length === 0) {
                alert('請加入商品到購物車');
                return;
            }
            const url = `${apiUrl}api/${apiPath}/order`;
            const order = this.form;
            axios.post(url, { data: order })
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message);
                        //輸入完資料按送出訂單，購物車清空 ( 這邊的form 為VForm元件底下的方法clearForm )
                        this.$refs.isvForm.resetForm(); 
                        this.form.message= '';
                        this.getCart();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        }

    },
    mounted() {
        this.getProducts();
        this.getCart();
    },
});
//VeeValidate 表單驗證元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);



//BS Modal 元件
app.component('userProductModal', productModal);

app.mount('#app');

