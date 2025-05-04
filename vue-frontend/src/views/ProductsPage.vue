<script setup>
import { ref, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";
import { useStore } from "vuex";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const store = useStore();

const products = computed(() => store.state.product.products);

onMounted(async () => {
  try {
    await store.dispatch("product/getAllProducts");
  } catch (error) {
    toast.error("Failed to load products");
  }
});
</script>

<template>
  <div class="products-page">
    <div class="page-header">
      <h1>Products</h1>
      <button class="add-button">Add Product</button>
    </div>

    <!-- Products Table -->
    <div class="table-container">
      <table v-if="products.length > 0 && !loading">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th style="display: flex; justify-content: end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>Rp. {{ product.price.toFixed(2) }},-</td>
            <td>{{ product.stock }}</td>
            <td class="action-buttons">
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading">
        <LoadingSpinner />
      </div>

      <div v-else class="empty-state">
        <p>No products found. Add your first product!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
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
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #059669;
}

.table-container {
  overflow-x: auto;
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

tr:hover {
  background-color: #f9fafb;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: end;
}

.edit-button {
  background-color: #adbb31;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #96a12c;
}

.delete-button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-button {
    width: 100%;
  }
}
</style>
