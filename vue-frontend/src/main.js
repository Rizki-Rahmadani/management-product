import { createApp } from "vue";
import { createStore } from "vuex";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from "./App.vue";
import router from "./router";
import "./style.css";

import productStore from "./stores/productStore";

const store = createStore({
    modules: {
        product: productStore,
    },
});

const app = createApp(App);

// Toast notification options
const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
};

app.use(store);
app.use(router);
app.use(Toast, toastOptions);
app.mount("#app");