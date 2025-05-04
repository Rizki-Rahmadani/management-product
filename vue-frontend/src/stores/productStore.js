import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5174/api",
});

export default {
  namespaced: true,
  state: () => ({
    products: [],
    loading: false,
    initialized: false,
  }),

  getters: {
    nextId: (state) => {
      return state.products.length > 0
        ? Math.max(...state.products.map((p) => p.id)) + 1
        : 1;
    },

    getProductById: (state) => (id) => {
      return state.products.find((product) => product.id === id);
    },

    getAllProducts: (state) => {
      return state.products;
    },

    isInitialized: (state) => {
      return state.initialized;
    },
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
      state.initialized = true;
    },
    SET_LOADING(state, value) {
      state.loading = value;
    },
    ADD_PRODUCT(state, product) {
      state.products.push(product);
    },
  },

  actions: {
    async initializeProducts({ commit, state }) {
      if (state.initialized) {
        return state.products;
      }

      commit("SET_LOADING", true);
      try {
        console.log("Fetching products from API...");
        const response = await api.get("/products");
        console.log("API Response:", response.data);

        if (response.data.includes("<html>")) {
          throw new Error("Received HTML response, likely an error page.");
        }

        let productsData = response.data;

        if (typeof productsData === "string") {
          try {
            productsData = JSON.parse(productsData);
          } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError);
            throw new Error("Invalid JSON response from server");
          }
        }

        if (productsData && productsData.data) {
          productsData = productsData.data;
        }

        if (!Array.isArray(productsData)) {
          console.error(
            "Invalid response format. Expected array, got:",
            typeof productsData
          );
          throw new Error("Invalid response format from server");
        }

        const formattedProducts = productsData.map((product) => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          stock: parseInt(product.stock),
          created_at: product.created_at,
          updated_at: product.updated_at,
        }));

        console.log("Formatted products:", formattedProducts);
        commit("SET_PRODUCTS", formattedProducts);
        return formattedProducts;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (error.response) {
          console.error("Server error response:", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
          throw new Error(
            error.response.data.message || "Failed to fetch products"
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error("No response from server");
        } else {
          console.error("Request setup error:", error.message);
          throw error;
        }
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async getAllProducts({ dispatch, state }) {
      if (!state.initialized) {
        return await dispatch("initializeProducts");
      }
      return state.products;
    },

    async addProduct({ commit }, productData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.post("/products", {
          name: productData.name,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock),
        });

        const newProduct = {
          id: response.data.id,
          name: response.data.name,
          price: parseFloat(response.data.price),
          stock: parseInt(response.data.stock),
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };

        commit("ADD_PRODUCT", newProduct);
        return newProduct;
      } catch (error) {
        console.error("Failed to add product:", error);
        if (error.response) {
          if (error.response.status === 422) {
            throw new Error(JSON.stringify(error.response.data.errors));
          }
        }
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
