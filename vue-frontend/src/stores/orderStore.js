import { format } from "date-fns";
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5174/api",
});

export default {
  namespaced: true,
  state: () => ({
    orders: [],
    loading: false,
    selectedOrderId: null,
  }),

  getters: {
    nextOrderId: (state) => {
      return state.orders.length > 0
        ? Math.max(...state.orders.map((o) => o.order_id)) + 1
        : 1;
    },

    getOrderById: (state) => (orderId) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return null;

      const totalItems = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = order.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      return {
        ...order,
        total_items: totalItems,
        total_price: totalPrice,
      };
    },

    getAllOrders: (state) => {
      return state.orders.map((order) => {
        const totalItems = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalPrice = order.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );

        return {
          ...order,
          total_items: totalItems,
          total_price: totalPrice,
        };
      });
    },
  },

  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_LOADING(state, value) {
      state.loading = value;
    },
    SET_SELECTED_ORDER(state, orderId) {
      state.selectedOrderId = orderId;
    },
  },

  actions: {
    async getAllOrders({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.get("/orders");
        const formattedOrders = response.data.map((order) => ({
          ...order,
          order_date: new Date(order.order_date).toISOString().split("T")[0],
          items: order.items.map((item) => ({
            ...item,
            price: parseFloat(item.price),
          })),
        }));
        commit("SET_ORDERS", formattedOrders);
        return formattedOrders;
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
