<template>
  <div v-if="order" class="order-details">
    <h2>Order Details</h2>
    <p><strong>Customer:</strong> {{ order.customer_name }}</p>
    <p><strong>Date:</strong> {{ formatDate(order.order_date) }}</p>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in orderItems" :key="index">
            <td>{{ item.product.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>Rp. {{ item.price.toFixed(2) }},-</td>
            <td>Rp. {{ item.subtotal.toFixed(2) }},-</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" class="total-label">Total</td>
            <td>Rp. {{ order.total_price.toFixed(2) }},-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { toRefs } from "vue";

const props = defineProps({
  order: Object,
});

const { order } = toRefs(props);

const orderItems = computed(() => {
  if (!order.value) return [];
  return order.value.items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.price,
  }));
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  background-color: #f3f4f6;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #374151;
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
</style>
