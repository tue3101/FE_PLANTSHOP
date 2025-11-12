<script setup>
import NavbarComponent from "@/components/common/admin/NavbarComponent.vue"
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <NavbarComponent />
    <div class="flex-1 overflow-y-auto">
      <router-view />
    </div>
  </div>

</template>
