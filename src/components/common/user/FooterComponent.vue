<script setup lang="ts">
import { Instagram } from 'lucide-vue-next';
import { Phone,Mail,MapIcon,Facebook,Youtube} from 'lucide-vue-next';


</script>

<template>
  <footer class=" text-white mt-10   "
  :style="{ backgroundImage: 'url(/img/footer.png)' }" background-size="cover" background-position="center">
    <!-- Top Section -->
    <div class="h-full mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-black/30 ">
      <!-- Logo & Giới thiệu -->
      <div>
        <div class="flex items-center space-x-3 mb-4">
          <img src="/img/cobala.png" alt="Logo" class="w-10 h-10 rounded-full" />
          <h2 class="text-xl font-bold text-green-100">Cỏ Ba Lá</h2>
        </div>
        <p class="text-sm text-green-200 leading-relaxed">
          Cỏ Ba Lá là cửa hàng chuyên cung cấp các loại cây cảnh, bonsai và chậu trồng cây chất lượng cao.
          Hãy để không gian của bạn trở nên tươi mới hơn mỗi ngày 🌿
        </p>
      </div>

      <!-- Liên kết nhanh -->
      <div>
        <h3 class="font-semibold text-green-100 mb-4">Liên kết nhanh</h3>
        <ul class="space-y-2 text-green-200 text-sm">
          <li><router-link to="/" class="hover:text-green-400">Trang chủ</router-link></li>
          <li><router-link to="/product" class="hover:text-green-400">Sản phẩm</router-link></li>
          <li><router-link to="/home" class="hover:text-green-400">Giới thiệu</router-link></li>
          <li><router-link to="/contact" class="hover:text-green-400">Liên hệ</router-link></li>
        </ul>
      </div>

      <!-- Hỗ trợ khách hàng -->
      <div>
        <h3 class="font-semibold text-green-100 mb-4">Social Media</h3>
        <ul class="w-30 space-y-2 text-green-200 ">
          <li class="flex items-center text-xl gap-1 cursor-pointer hover:text-blue-700"><Facebook class="w-6 h-6  " /> Facebook</li>
          <li class="flex items-center text-xl gap-1 cursor-pointer hover:text-red-500"><Youtube class="w-6 h-6 " /> Youtube</li>
          <li class="flex items-center text-xl gap-1 cursor-pointer hover:text-pink-500"><Instagram class="w-6 h-6 " />Instagram</li>
        </ul>
      </div>

      <!-- Liên hệ -->
      <div>
        <h3 class="font-semibold text-green-100 mb-4">Liên hệ</h3>
        <ul class="text-green-200 text-sm space-y-2">
          <li class="flex gap-2 items-center"><MapIcon/> 45 Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh</li>
          <li class="flex gap-2 items-center"><Phone/> 0937397986</li>
          <li class="flex gap-2 items-center"><Mail/> cobala.shop@gmail.com</li>
        </ul>
       
      </div>
    </div>

    <!-- Bottom Section -->
    <div class=" bg-green-700 nborder-t border-green-800 text-center py-4 text-sm text-green-300">
      2025 <span class="font-semibold text-green-100">Cỏ Ba Lá - Nguyễn Ngọc Thanh Tuệ</span> 
    </div>
  </footer>
</template>
