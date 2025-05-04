<script setup>
import { ref, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";
import { useStore } from "vuex";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog.vue";

const store = useStore();
const toast = useToast();

const showAddForm = ref(false);
const editingProduct = ref(null);
const showDeleteDialog = ref(false);
const productToDelete = ref(null);

// Form data
const formData = ref({
  name: "",
  price: "",
  stock: "",
});

// Form validation
const formErrors = ref({
  name: "",
  price: "",
  stock: "",
});

// Computed properties
const products = computed(() => store.state.product.products);
const loading = computed(() => store.state.product.loading);

onMounted(async () => {
  try {
    await store.dispatch("product/getAllProducts");
  } catch (error) {
    toast.error("Failed to load products");
  }
});

// Validation rules
const validateForm = () => {
  let isValid = true;
  formErrors.value = {
    name: "",
    price: "",
    stock: "",
  };

  // Name validation
  if (!formData.value.name) {
    formErrors.value.name = "Name is required";
    isValid = false;
  } else if (formData.value.name.length < 3) {
    formErrors.value.name = "Name must be at least 3 characters";
    isValid = false;
  }

  // Price validation
  if (!formData.value.price) {
    formErrors.value.price = "Price is required";
    isValid = false;
  } else if (parseFloat(formData.value.price) <= 0) {
    formErrors.value.price = "Price must be greater than 0";
    isValid = false;
  }

  // Stock validation
  if (formData.value.stock === "") {
    formErrors.value.stock = "Stock is required";
    isValid = false;
  } else if (parseInt(formData.value.stock) < 0) {
    formErrors.value.stock = "Stock cannot be negative";
    isValid = false;
  }

  return isValid;
};

// Reset form
const resetForm = () => {
  formData.value = {
    name: "",
    price: "",
    stock: "",
  };
  formErrors.value = {
    name: "",
    price: "",
    stock: "",
  };
  showAddForm.value = false;
  editingProduct.value = null;
};

// Add new product
const addProduct = async () => {
  if (!validateForm()) return;

  try {
    await store.dispatch("product/addProduct", formData.value);
    toast.success("Product added successfully");
    resetForm();
  } catch (error) {
    toast.error("Failed to add product");
  }
};

// Edit product
const startEditProduct = (product) => {
  editingProduct.value = product.id;
  formData.value = {
    name: product.name,
    price: product.price.toString(),
    stock: product.stock.toString(),
  };
  showAddForm.value = false;
};

// Update product
const updateProduct = async () => {
  if (!validateForm()) return;

  try {
    await store.dispatch("product/updateProduct", {
      id: editingProduct.value,
      ...formData.value,
    });
    toast.success("Product updated successfully");
    resetForm();
  } catch (error) {
    toast.error("Failed to update product");
  }
};

// Delete product
const deleteProduct = async (id) => {
  productToDelete.value = products.value.find((p) => p.id === id);
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  try {
    await store.dispatch("product/deleteProduct", productToDelete.value.id);
    toast.success("Product deleted successfully");
    showDeleteDialog.value = false;
    productToDelete.value = null;
  } catch (error) {
    if (error.message.includes("referenced in existing orders")) {
      toast.error(
        "Cannot delete product. It is referenced in existing orders."
      );
    } else {
      toast.error(error.message || "Failed to delete product");
    }
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
  productToDelete.value = null;
};
</script>

<template>
  <div class="products-page">
    <div class="page-header">
      <h1>Products</h1>
      <button
        class="add-button"
        @click="
          showAddForm = !showAddForm;
          editingProduct = null;
        "
        v-if="!editingProduct"
      >
        {{ showAddForm ? "Cancel" : "Add Product" }}
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm || editingProduct" class="product-form">
      <h2>{{ editingProduct ? "Edit Product" : "Add New Product" }}</h2>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          :class="{ error: formErrors.name }"
        />
        <span class="error-message" v-if="formErrors.name">{{
          formErrors.name
        }}</span>
      </div>

      <div class="form-group">
        <label for="price">Price</label>
        <input
          type="number"
          id="price"
          v-model="formData.price"
          min="0.01"
          step="0.01"
          :class="{ error: formErrors.price }"
        />
        <span class="error-message" v-if="formErrors.price">{{
          formErrors.price
        }}</span>
      </div>

      <div class="form-group">
        <label for="stock">Stock</label>
        <input
          type="number"
          id="stock"
          v-model="formData.stock"
          min="0"
          step="1"
          :class="{ error: formErrors.stock }"
        />
        <span class="error-message" v-if="formErrors.stock">{{
          formErrors.stock
        }}</span>
      </div>

      <div class="form-actions">
        <button @click="resetForm" class="secondary-button">Cancel</button>
        <button
          v-if="editingProduct"
          @click="updateProduct"
          class="primary-button"
        >
          Update Product
        </button>
        <button v-else @click="addProduct" class="primary-button">
          Add Product
        </button>
      </div>
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
              <button @click="startEditProduct(product)" class="edit-button">
                Edit
              </button>
              <button @click="deleteProduct(product.id)" class="delete-button">
                Delete
              </button>
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

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmationDialog
      :show="showDeleteDialog"
      :itemName="productToDelete?.name || ''"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
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

.product-form {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #5a80e9;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.primary-button {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background-color: #09815b;
}

.secondary-button {
  background-color: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.secondary-button:hover {
  background-color: #d1d5db;
}

.table-container {
  border-radius: 5px;
  overflow-x: auto;
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
