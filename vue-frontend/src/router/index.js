import { createRouter, createWebHistory } from "vue-router";
import ProductsPage from "../views/ProductsPage.vue";
import OrdersPage from "../views/OrdersPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/products",
  },
  {
    path: "/products",
    name: "Products",
    component: ProductsPage,
  },
  {
    path: "/orders",
    name: "Orders",
    component: OrdersPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
