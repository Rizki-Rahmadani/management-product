import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

    UPDATE_PRODUCT(state, updatedProduct) {
      const index = state.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    },

    DELETE_PRODUCT(state, productId) {
      state.products = state.products.filter((p) => p.id !== productId);
    },

    UPDATE_PRODUCT_STOCK(state, { productId, quantity }) {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        product.stock -= quantity;
      }
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

        // Handle different response formats
        let productsData = response.data;

        // If response is a string, try to parse it as JSON
        if (typeof productsData === "string") {
          try {
            productsData = JSON.parse(productsData);
          } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError);
            throw new Error("Invalid JSON response from server");
          }
        }

        // Handle nested data structure
        if (productsData && productsData.data) {
          productsData = productsData.data;
        }

        // Ensure we have an array
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

    async updateProduct({ commit }, productData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(`/products/${productData.id}`, {
          name: productData.name,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock),
        });

        const updatedProduct = {
          id: response.data.id,
          name: response.data.name,
          price: parseFloat(response.data.price),
          stock: parseInt(response.data.stock),
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };

        commit("UPDATE_PRODUCT", updatedProduct);
        return updatedProduct;
      } catch (error) {
        console.error("Failed to update product:", error);
        if (error.response) {
          if (error.response.status === 422) {
            throw new Error(JSON.stringify(error.response.data.errors));
          } else if (error.response.status === 404) {
            throw new Error("Product not found");
          }
        }
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateProductStock({ commit }, { productId, quantity }) {
      commit("UPDATE_PRODUCT_STOCK", { productId, quantity });
    },

    async deleteProduct({ commit }, productId) {
      commit("SET_LOADING", true);
      try {
        const id = parseInt(productId);
        if (isNaN(id)) {
          throw new Error("Invalid product ID");
        }

        console.log("Attempting to delete product with ID:", id);
        const response = await api.delete(`/products/${id}`);
        console.log("Delete response:", response);

        if (response.status === 200 || response.status === 204) {
          commit("DELETE_PRODUCT", id);
          return true;
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
        if (error.response) {
          console.error("Server error response:", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
          if (error.response.status === 404) {
            throw new Error("Product not found");
          } else if (error.response.status === 400) {
            throw new Error(
              error.response.data.error ||
                "Cannot delete product. It is referenced in existing orders."
            );
          } else if (error.response.status === 500) {
            throw new Error("Server error occurred while deleting product");
          }
          throw new Error(
            error.response.data.message || "Failed to delete product"
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
  },
};
