<template>
   <div class="min-h-screen bg-green-50 py-12">
      <div class="container mx-auto px-4">
         <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-green-700 mb-4">Liên hệ với chúng tôi</h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
               Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ trực tiếp với chúng tôi!
            </p>
         </div>

         <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-8">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">


                  <!-- Thông tin liên hệ - Bên phải -->
                  <div>
                     <h2 class="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
                        <MapPin :size="24" />
                        Thông tin liên hệ
                     </h2>
                     <div class="space-y-6">

                        <div class="flex gap-4">
                           <div class="flex-shrink-0">
                              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                 <MapPin class="w-6 h-6 text-green-600" />
                              </div>
                           </div>
                           <div>
                              <h3 class="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
                              <p class="text-gray-600">45 Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh</p>
                           </div>
                        </div>

                        <div class="flex gap-4">
                           <div class="flex-shrink-0">
                              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                 <Phone class="w-6 h-6 text-green-600" />
                              </div>
                           </div>
                           <div>
                              <h3 class="font-semibold text-gray-800 mb-1">Số điện thoại</h3>
                              <p class="text-gray-600">0937397986</p>
                           </div>
                        </div>

                        <div class="flex gap-4">
                           <div class="flex-shrink-0">
                              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                 <Mail class="w-6 h-6 text-green-600" />
                              </div>
                           </div>
                           <div>
                              <h3 class="font-semibold text-gray-800 mb-1">Email</h3>
                              <p class="text-gray-600">cobala.shop@gmail.com</p>
                           </div>
                        </div>

                        <div class="flex gap-4">
                           <div class="flex-shrink-0">
                              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                 <Clock class="w-6 h-6 text-green-600" />
                              </div>
                           </div>
                           <div>
                              <h3 class="font-semibold text-gray-800 mb-1">Giờ làm việc</h3>
                              <p class="text-gray-600">Thứ 2 - Chủ nhật: 8:30 - 22:00</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <!-- Mạng xã hội - Bên trái -->
                  <div>
                     <h2 class="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
                        <Users :size="24" />
                        Theo dõi chúng tôi
                     </h2>
                     <div class="flex gap-4">
                        <a href="#" target="_blank"
                           class="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors">
                           <Facebook :size="24" />
                        </a>
                        <a href="#" target="_blank"
                           class="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors">
                           <Youtube :size="24" />
                        </a>
                        <a href="#" target="_blank"
                           class="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white transition-colors">
                           <Instagram :size="24" />
                        </a>
                     </div>
                     <div>
                        <p class="text-gray-600 mt-6">
                           Trong quá trình mua hàng nếu có bất kì vấn đề phát sinh nào, bạn vui lòng liên hệ với chúng tôi qua các kênh trên hoặc để được hỗ trợ nhanh nhất hãy liên hệ qua số điện thoại hotline 0937 3979 86.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { Youtube } from 'lucide-vue-next';
import { MapPin, Phone, Mail, Clock, Users, Facebook, Instagram } from 'lucide-vue-next'
</script>
