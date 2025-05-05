<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useStore } from "vuex";
import LoadingSpinner from "./LoadingSpinner.vue";

const store = useStore();
const toast = useToast();
const router = useRouter();

const products = ref([]);
const loading = ref(false);

// Form state
const customerName = ref("");
const orderDate = ref(new Date().toISOString().slice(0, 10));
const selectedProductId = ref("");
const selectedQuantity = ref(1);
const orderItems = ref([]);

// Validation errors
const errors = ref({
  customerName: "",
  orderDate: "",
  selectedProductId: "",
  selectedQuantity: "",
  orderItems: "",
});

// Emit events
const emit = defineEmits(["close"]);

// Load products on mount
onMounted(async () => {
  if (!store.state.products || store.state.products.length === 0) {
    try {
      products.value = await store.dispatch("product/getAllProducts");
    } catch (error) {
      toast.error("Failed to load products");
    }
  } else {
    products.value = store.state.products;
  }
});

// Get selected product details
const selectedProduct = computed(() => {
  if (!selectedProductId.value) return null;
  return products.value.find((p) => p.id === parseInt(selectedProductId.value));
});

// Calculate total price of order
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});

// Format price to Indonesian Rupiah
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Validate quantity input against available stock
const validateQuantity = () => {
  errors.value.selectedQuantity = "";

  if (!selectedProduct.value) {
    errors.value.selectedProductId = "Please select a product";
    return false;
  }

  errors.value.selectedProductId = "";

  if (!selectedQuantity.value || selectedQuantity.value <= 0) {
    errors.value.selectedQuantity = "Quantity must be greater than 0";
    return false;
  }

  if (selectedQuantity.value > selectedProduct.value.stock) {
    errors.value.selectedQuantity = `Only ${selectedProduct.value.stock} items in stock`;
    return false;
  }

  return true;
};

// Add item to order
const addItem = () => {
  if (!validateQuantity()) return;

  // Check if product already exists in the order
  const existingItemIndex = orderItems.value.findIndex(
    (item) => item.product_id === parseInt(selectedProductId.value)
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    const newQuantity =
      orderItems.value[existingItemIndex].quantity +
      parseInt(selectedQuantity.value);

    // Check if new quantity exceeds stock
    if (newQuantity > selectedProduct.value.stock) {
      errors.value.selectedQuantity = `Cannot add ${selectedQuantity.value} more. Total would exceed available stock`;
      return;
    }

    orderItems.value[existingItemIndex].quantity = newQuantity;
    orderItems.value[existingItemIndex].subtotal =
      newQuantity * orderItems.value[existingItemIndex].price;

    toast.success("Item quantity updated");
  } else {
    // Add new item
    orderItems.value.push({
      product_id: parseInt(selectedProductId.value),
      product_name: selectedProduct.value.name,
      quantity: parseInt(selectedQuantity.value),
      price: selectedProduct.value.price,
      subtotal: selectedProduct.value.price * parseInt(selectedQuantity.value),
    });

    toast.success("Item added to order");
  }

  // Reset selection
  selectedProductId.value = "";
  selectedQuantity.value = 1;
};

// Remove item from order
const removeItem = (index) => {
  orderItems.value.splice(index, 1);
  toast.info("Item removed from order");
};

// Validate entire form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    customerName: "",
    orderDate: "",
    selectedProductId: "",
    selectedQuantity: "",
    orderItems: "",
  };

  if (!customerName.value.trim()) {
    errors.value.customerName = "Customer name is required";
    isValid = false;
  }

  if (!orderDate.value) {
    errors.value.orderDate = "Order date is required";
    isValid = false;
  }

  if (orderItems.value.length === 0) {
    errors.value.orderItems = "Order must contain at least one item";
    isValid = false;
  }

  return isValid;
};

// Submit the order
const createOrder = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    await store.dispatch("order/createOrder", {
      customer_name: customerName.value,
      order_date: orderDate.value,
      items: orderItems.value.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });

    toast.success("Order created successfully");
    router.push("/orders");
  } catch (error) {
    toast.error("Failed to create order");
  } finally {
    loading.value = false;
  }
};

// Close dialog function
const closeDialog = () => {
  emit("close");
};
</script>

<template>
  <div class="add-order-page">
    <div class="order-form">
      <!-- <div class="form-header">
        <h1>Create New Order</h1>
        <p>Fill in the details below to create a new order</p>
      </div> -->

      <div class="form-content">
        <!-- Left Section - Customer Info -->
        <div class="form-left">
          <div class="form-card">
            <div class="card-header">
              <i class="icon">👤</i>
              <h2>Customer Information</h2>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label for="customerName">Customer Name</label>
                <div class="input-wrapper">
                  <i class="icon">👤</i>
                  <input
                    type="text"
                    id="customerName"
                    v-model="customerName"
                    placeholder="Enter customer name"
                    :class="{ error: errors.customerName }"
                  />
                </div>
                <span class="error-message" v-if="errors.customerName">{{
                  errors.customerName
                }}</span>
              </div>

              <div class="form-group">
                <label for="orderDate">Order Date</label>
                <div class="input-wrapper">
                  <i class="icon">📅</i>
                  <input
                    type="date"
                    id="orderDate"
                    v-model="orderDate"
                    :class="{ error: errors.orderDate }"
                  />
                </div>
                <span class="error-message" v-if="errors.orderDate">{{
                  errors.orderDate
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section - Order Items -->
        <div class="form-right">
          <div class="form-card">
            <div class="card-header">
              <i class="icon">🛒</i>
              <h2>Add Products</h2>
            </div>
            <div class="card-body">
              <div class="product-selection">
                <div class="form-group">
                  <label for="product">Select Product</label>
                  <div class="input-wrapper">
                    <i class="icon">📦</i>
                    <select
                      id="product"
                      v-model="selectedProductId"
                      :class="{ error: errors.selectedProductId }"
                    >
                      <option value="">Choose a product</option>
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product.id"
                        :disabled="product.stock <= 0"
                      >
                        {{ product.name }} (Stock: {{ product.stock }})
                      </option>
                    </select>
                  </div>
                  <span class="error-message" v-if="errors.selectedProductId">{{
                    errors.selectedProductId
                  }}</span>
                </div>

                <div class="form-group">
                  <label for="quantity">Quantity</label>
                  <div class="input-wrapper">
                    <i class="icon">🔢</i>
                    <input
                      type="number"
                      id="quantity"
                      v-model="selectedQuantity"
                      min="1"
                      :max="selectedProduct ? selectedProduct.stock : 999"
                      :disabled="!selectedProduct"
                      :class="{ error: errors.selectedQuantity }"
                    />
                  </div>
                  <span class="error-message" v-if="errors.selectedQuantity">{{
                    errors.selectedQuantity
                  }}</span>
                </div>

                <button
                  @click="addItem"
                  class="add-item-button"
                  :disabled="!selectedProductId || loading"
                >
                  <i class="icon">+</i> Add to Order
                </button>
              </div>

              <div class="order-summary">
                <h3>Order Summary</h3>
                <div v-if="orderItems.length > 0" class="items-list">
                  <div
                    v-for="(item, index) in orderItems"
                    :key="index"
                    class="order-item"
                  >
                    <div class="item-info">
                      <span class="item-name">{{ item.product_name }}</span>
                      <span class="item-quantity">x{{ item.quantity }}</span>
                    </div>
                    <div class="item-actions">
                      <span class="item-price">{{
                        formatPrice(item.subtotal)
                      }}</span>
                      <button @click="removeItem(index)" class="remove-button">
                        <i class="icon">×</i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-cart">
                  <i class="icon">🛒</i>
                  <p>No items added yet</p>
                </div>
                <div class="total-section">
                  <span>Total</span>
                  <span class="total-price">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="closeDialog" class="cancel-button">
          <i class="icon">←</i> Cancel
        </button>
        <button
          @click="createOrder"
          class="create-button"
          :disabled="orderItems.length === 0 || loading"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>Create Order</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>
  </div>
</template>

<style scoped>
.add-order-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f6f7fb 0%, #f0f2f5 100%);
  min-height: 100vh;
}

.order-form {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.form-header {
  padding: 2.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: white;
  text-align: center;
}

.form-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.form-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  padding: 2rem;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.card-header .icon {
  font-size: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #4f46e5;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.product-selection {
  margin-bottom: 2rem;
}

.add-item-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.add-item-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.15);
}

.order-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
}

.order-summary h3 {
  margin: 0 0 1rem;
  color: #1f2937;
  font-size: 1.1rem;
}

.items-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  color: #6b7280;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-price {
  font-weight: 600;
  color: #1f2937;
}

.remove-button {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: #fecaca;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
}

.total-price {
  color: #4f46e5;
  font-size: 1.2rem;
}

.form-actions {
  padding: 2rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button {
  padding: 0.875rem 1.5rem;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.create-button {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.15);
}

.create-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

@media (max-width: 1024px) {
  .form-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .add-order-page {
    padding: 1rem;
  }

  .form-header {
    padding: 1.5rem;
  }

  .form-content {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
