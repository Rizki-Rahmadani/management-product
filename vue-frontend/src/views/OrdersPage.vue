<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useStore } from "vuex";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import { useRouter } from "vue-router";
import AddOrderPage from "../components/AddOrderPage.vue";
import OrderDetails from "../components/OrderDetails.vue";

const store = useStore();
const toast = useToast();

const orders = computed(() => store.getters["order/getAllOrders"]);
const selectedOrder = ref(null);

const loading = computed(() => store.state.order.loading);

onMounted(async () => {
  try {
    await store.dispatch("order/getAllOrders");
  } catch (error) {
    toast.error("Failed to load orders");
  }
});

const selectOrder = (order) => {
  selectedOrder.value = selectedOrder.value?.id === order.id ? null : order;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const showDialog = ref(false);

const showAddOrderDialog = () => {
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const handleOrderAdded = (newOrder) => {
  closeDialog();
  store.dispatch("order/getAllOrders");
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>Orders</h1>
      <button @click="showAddOrderDialog" class="add-button">Add Order</button>
    </div>

    <!-- Add Order Dialog -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <div>
            <h1>Create New Order</h1>
            <p class="form-description">Fill in the order details below</p>
          </div>
          <button @click="closeDialog" class="close-button">&times;</button>
        </div>
        <AddOrderPage @close="closeDialog" @order-added="handleOrderAdded" />
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <table v-if="orders.length > 0 && !loading">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Order Date</th>
            <th>Total Items</th>
            <th style="display: flex; justify-content: end">Total Price</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            @click="selectOrder(order)"
            :class="{ selected: selectedOrder?.id === order.id }"
            class="clickable-row"
          >
            <td>{{ order.id }}</td>
            <td>{{ order.customer_name }}</td>
            <td>{{ formatDate(order.order_date) }}</td>
            <td>{{ order.total_items }}</td>
            <td style="display: flex; justify-content: end">
              {{ formatPrice(order.total_price) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading">
        <LoadingSpinner />
      </div>

      <div v-else class="empty-state">
        <p>No orders found. Create your first order!</p>
      </div>
    </div>

    <!-- Order Details -->
    <div>
      <OrderDetails :order="selectedOrder" />
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  margin-bottom: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-button {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
  display: inline-block;
}

.add-button:hover {
  background-color: #059669;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  background-color: #5a80e9;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #eff3f8;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: #f9fafb;
}

.clickable-row.selected {
  background-color: #eff6ff;
}

.order-details {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.order-details h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1f2937;
}

.total-row {
  font-weight: 600;
}

.total-label {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-button {
    width: 100%;
    text-align: center;
  }
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: #ccd8f8;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.dialog-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #5a80e9;
  color: #e5e7eb;
}

.dialog-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #e5e7eb;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #ffffff;
  padding: 0.5rem;
  line-height: 1;
}

.close-button:hover {
  color: #1f2937;
}
</style>
