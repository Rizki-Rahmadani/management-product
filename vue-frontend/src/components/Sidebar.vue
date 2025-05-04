<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isCollapsed = ref(false);
const isMobile = ref(false);
const isSidebarOpen = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value) {
    isCollapsed.value = false;
    isSidebarOpen.value = false;
  }
};

const toggleSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = !isSidebarOpen.value;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
};

const closeSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }
};

const navigateTo = (path) => {
  router.push(path);
  closeSidebar();
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <div class="mobile-menu-button" @click="toggleSidebar" v-if="isMobile">
    <span></span>
    <span></span>
    <span></span>
  </div>

  <div
    class="sidebar-overlay"
    v-if="isMobile && isSidebarOpen"
    @click="closeSidebar"
  ></div>

  <div
    class="sidebar"
    :class="{
      collapsed: isCollapsed && !isMobile,
      'mobile-open': isSidebarOpen,
      'mobile-closed': !isSidebarOpen && isMobile,
    }"
  >
    <div class="sidebar-header">
      <h1>Store Manager</h1>
      <button
        class="toggle-button"
        @click="toggleSidebar"
        :class="{ 'menu-open': isSidebarOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <div class="sidebar-menu">
      <div
        class="menu-item"
        @click="navigateTo('/products')"
        :class="{ active: $route.path === '/products' }"
      >
        <i class="icon">📦</i>
        <span>Products</span>
      </div>
      <div
        class="menu-item"
        @click="navigateTo('/orders')"
        :class="{ active: $route.path === '/orders' }"
      >
        <i class="icon">📋</i>
        <span>Orders</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #5a80e9;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-menu-button {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-menu-button span {
  display: block;
  width: 25px;
  height: 2px;
  background-color: #5a80e9;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  font-size: 1.25rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.toggle-button span {
  display: block;
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Transform hamburger to X when menu is open */
.toggle-button.menu-open span:nth-child(1) {
  transform: translateY(4px) rotate(50deg);
}

.toggle-button.menu-open span:nth-child(2) {
  opacity: 0;
}

.toggle-button.menu-open span:nth-child(3) {
  transform: translateY(-8px) rotate(-50deg);
}

.sidebar-menu {
  padding: 1rem 0;
}

.menu-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-item .icon {
  font-size: 1.25rem;
  min-width: 24px;
  text-align: center;
}

.menu-item span {
  white-space: nowrap;
  overflow: hidden;
}

@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
    z-index: 0;
  }

  .sidebar {
    transform: translateX(-100%);
    width: 250px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.mobile-closed {
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    width: 250px;
  }
}
</style>
