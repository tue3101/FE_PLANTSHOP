<script setup>
import HeaderComponent from "@/components/common/user/HeaderComponent.vue"
import FooterComponent from "@/components/common/user/FooterComponent.vue"
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
<template>
  <div class="flex flex-col min-h-screen">
    <HeaderComponent />
    <div class="w-full">
      <router-view />
    </div>
    <FooterComponent />
  </div>
</template>
