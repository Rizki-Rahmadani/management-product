<script setup>
import { RouterView } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: #f3f4f6;
  line-height: 1.5;
}

.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  transition: margin-left 0.3s ease;
  width: calc(100% - 250px);
  min-height: 100vh;
  background-color: #f3f4f6;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.sidebar.collapsed + .main-content {
  margin-left: 60px;
  width: calc(100% - 60px);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
    padding-top: 4rem;
  }

  .content-wrapper {
    padding: 0 1rem;
  }

  .sidebar.collapsed + .main-content {
    margin-left: 0;
    width: 100%;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
