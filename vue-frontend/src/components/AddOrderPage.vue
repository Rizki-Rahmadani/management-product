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
      <div class="form-sections">
        <!-- Customer Info Section -->
        <div class="form-section">
          <h2>Customer Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="customerName">Customer Name</label>
              <input
                type="text"
                id="customerName"
                v-model="customerName"
                placeholder="Enter customer name"
                :class="{ error: errors.customerName }"
              />
              <span class="error-message" v-if="errors.customerName">{{
                errors.customerName
              }}</span>
            </div>

            <div class="form-group">
              <label for="orderDate">Order Date</label>
              <input
                type="date"
                id="orderDate"
                v-model="orderDate"
                :class="{ error: errors.orderDate }"
              />
              <span class="error-message" v-if="errors.orderDate">{{
                errors.orderDate
              }}</span>
            </div>
          </div>
        </div>

        <!-- Add Items Section -->
        <div class="form-section">
          <h2>Add Order Items</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="product">Product</label>
              <select
                id="product"
                v-model="selectedProductId"
                :class="{ error: errors.selectedProductId }"
              >
                <option value="">Select a product</option>
                <option
                  v-for="product in products"
                  :key="product.id"
                  :value="product.id"
                  :disabled="product.stock <= 0"
                >
                  {{ product.name }} (Stock: {{ product.stock }})
                </option>
              </select>
              <span class="error-message" v-if="errors.selectedProductId">{{
                errors.selectedProductId
              }}</span>
            </div>

            <div class="form-group">
              <label for="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                v-model="selectedQuantity"
                min="1"
                :max="selectedProduct ? selectedProduct.stock : 999"
                :disabled="!selectedProduct"
                :class="{ error: errors.selectedQuantity }"
              />
              <span class="error-message" v-if="errors.selectedQuantity">{{
                errors.selectedQuantity
              }}</span>
            </div>

            <div class="form-group button-group">
              <button
                @click="addItem"
                class="add-item-button"
                :disabled="!selectedProductId || loading"
              >
                <i class="icon">+</i> Add Item
              </button>
            </div>
          </div>

          <div v-if="errors.orderItems" class="error-message">
            {{ errors.orderItems }}
          </div>
        </div>

        <!-- Order Items Table -->
        <div class="form-section">
          <h2>Order Items Summary</h2>
          <div class="table-container" v-if="orderItems.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>${{ item.price.toFixed(2) }}</td>
                  <td>${{ item.subtotal.toFixed(2) }}</td>
                  <td>
                    <button @click="removeItem(index)" class="remove-button">
                      <i class="icon">×</i> Remove
                    </button>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="total-label">Total</td>
                  <td colspan="2">${{ totalPrice.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-cart">
            <i class="icon">🛒</i>
            <p>No items added yet</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
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

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>
  </div>
</template>

<style scoped>
.add-order-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.order-form {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.form-description {
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-sections {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-section h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #1f2937;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: end;
}

.add-item-button {
  background-color: #5a80e9;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-item-button:hover:not(:disabled) {
  background-color: #4338ca;
}

.add-item-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  background-color: #f3f4f6;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.total-row {
  font-weight: 600;
  background-color: #f8fafc;
}

.total-label {
  text-align: right;
}

.remove-button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-button:hover {
  background-color: #dc2626;
}

.empty-cart {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.empty-cart .icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  background-color: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button:hover {
  background-color: #d1d5db;
}

.create-button {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-button:hover:not(:disabled) {
  background-color: #059669;
}

.create-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

@media (max-width: 768px) {
  .add-order-page {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button,
  .form-actions a {
    width: 100%;
    justify-content: center;
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
  }
}

@media (min-width: 769px) and (max-width: 891px) {
  .button-group {
    display: flex;
    align-items: flex-start;
    justify-content: end;
  }
}
</style>
