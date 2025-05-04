<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog-content">
      <h3>Konfirmasi Hapus</h3>
      <p>Apakah Anda yakin ingin menghapus {{ itemName }}?</p>
      <div class="dialog-actions">
        <button @click="handleCancel" class="secondary-button">Batal</button>
        <button @click="handleConfirm" class="delete-button">Hapus</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
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
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.dialog-content h3 {
  margin: 0 0 1rem;
  color: #374151;
  font-size: 1.25rem;
}

.dialog-content p {
  margin: 0 0 1.5rem;
  color: #6b7280;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

.delete-button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #dc2626;
}
</style>
