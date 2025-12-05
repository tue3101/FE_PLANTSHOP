<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex p-6 border-b bg-gray-50">
        <div class="flex w-full">
          <h2 class="text-2xl font-bold text-gray-800">
            {{
              type === "order"
                ? `Chi tiết đơn #${data?.order_id || ""}`
                : `Chi tiết giao dịch
                        #${data?.payment_id || ""}`
            }}
          </h2>
        </div>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer ml-4"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div v-if="data">
          <!-- Order View -->
          <template v-if="type === 'order'">
            <!-- Customer Information -->
            <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label class="text-1xl font-semibold text-gray-900">Tên khách hàng:</label>
                <p class="text-gray-600 font-medium">{{ data.customer || "Không có" }}</p>
              </div>

              <div>
                <label class="text-1xl font-semibold text-gray-900">Số điện thoại:</label>
                <p class="text-gray-900">{{ data.phone || "Không có" }}</p>
              </div>
              <div>
                <label class="text-1xl font-semibold text-gray-900">Địa chỉ:</label>
                <p class="text-gray-900">{{ data.address || "Không có" }}</p>
              </div>

              <div>
                <label class="text-1xl font-semibold text-gray-900">Ngày đặt:</label>
                <p class="text-gray-900">{{ data.created_at || "Không có" }}</p>
              </div>
            </div>

            <!-- Product Details Table -->
            <div class="mb-4">
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-300 text-left">
                      <th
                        class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700"
                      >
                        Mã sản phẩm
                      </th>
                      <th
                        class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700"
                      >
                        Tên sản phẩm
                      </th>
                      <th
                        class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                      >
                        Số lượng
                      </th>
                      <th
                        class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                      >
                        Đơn giá
                      </th>
                      <th
                        class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                      >
                        Tạm tính
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!data.order_details || data.order_details.length === 0">
                      <td
                        colspan="5"
                        class="border border-gray-700 px-4 py-4 text-center text-gray-500"
                      >
                        Không có sản phẩm nào
                      </td>
                    </tr>
                    <tr
                      v-for="(detail, index) in data.order_details"
                      :key="index"
                      class="hover:bg-gray-50"
                    >
                      <td class="border border-gray-700 px-4 py-3 text-sm text-gray-900">
                        {{ detail.product_id || detail.product?.product_id || "N/A" }}
                      </td>
                      <td class="border border-gray-700 px-4 py-3 text-sm text-gray-900">
                        {{ detail.product_name || detail.product?.product_name || "N/A" }}
                      </td>
                      <td
                        class="border border-gray-700 px-4 py-3 text-sm text-gray-900 text-center"
                      >
                        {{ detail.quantity || 0 }}
                      </td>
                      <td
                        class="border border-gray-700 px-4 py-3 text-sm text-gray-900 text-center"
                      >
                        {{ formatPrice(detail.price_at_order || detail.price || 0) }}
                      </td>
                      <td
                        class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 text-center"
                      >
                        {{
                          formatPrice(
                            (detail.price_at_order || detail.price || 0) * (detail.quantity || 0)
                          )
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Ghi chú:</label>
                <p class="text-gray-900 bg-white p-3 rounded border border-gray-500 min-h-[60px]">
                  {{ data.note || "Không có" }}
                </p>
              </div>
              <div class="flex justify-end">
                <div class="w-full md:w-1/2 space-y-2">
                  <div class="flex justify-between text-sm pt-4">
                    <span class="text-gray-600">Tạm tính:</span>
                    <span class="text-gray-900 font-medium">{{
                      formatPrice(data.total || 0)
                    }}</span>
                  </div>
                  <div
                    v-if="
                      data.discount > 0 || data.discount_amount > 0 || data.auto_discount_amount > 0
                    "
                    class="space-y-1"
                  >
                    <!-- Auto Discount -->
                    <div v-if="data.auto_discount_amount > 0" class="flex justify-between text-sm">
                      <span class="text-gray-600">Giảm giá tự động:</span>
                      <span class="text-green-600 font-medium"
                        >-{{ formatPrice(data.auto_discount_amount || 0) }}</span
                      >
                    </div>
                    <!-- Special Discount (from discount code) -->
                    <div v-if="specialDiscountAmount > 0" class="flex justify-between text-sm">
                      <span class="text-gray-600">
                        Giảm giá
                        <span v-if="data.discount_code">({{ data.discount_code }})</span>:
                      </span>
                      <span class="text-red-600 font-medium"
                        >-{{ formatPrice(specialDiscountAmount) }}</span
                      >
                    </div>
                    <!-- Total Discount (fallback if no breakdown) -->
                    <div
                      v-if="
                        !data.auto_discount_amount &&
                        !specialDiscountAmount &&
                        (data.discount > 0 || data.discount_amount > 0)
                      "
                      class="flex justify-between text-sm"
                    >
                      <span class="text-gray-600">
                        Giảm giá
                        <span v-if="data.discount_code">({{ data.discount_code }})</span>:
                      </span>
                      <span class="text-red-600 font-medium"
                        >-{{ formatPrice(data.discount || data.discount_amount || 0) }}</span
                      >
                    </div>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Phí vận chuyển:</span>
                    <span class="text-gray-900 font-medium">{{
                      formatPrice(data.shipping_fee || 0)
                    }}</span>
                  </div>

                  <!-- Chỉ hiển thị đặt cọc khi đã đặt cọc thành công (paid = true) -->
                  <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                    <div class="flex justify-between text-sm items-center">
                      <span class="text-gray-600">Đã đặt cọc:</span>
                      <span class="font-semibold text-green-600">{{
                        formatPrice(data.deposit?.amount || 0)
                      }}</span>
                    </div>
                  </template>

                  <div
                    class="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2"
                  >
                    <span class="text-gray-800">Tổng cộng:</span>
                    <span class="text-green-600">{{ formatPrice(data.final_total || 0) }}</span>
                  </div>

                  <!-- Deposit Information - Chỉ hiển thị khi đã đặt cọc thành công -->
                  <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                    <div class="flex justify-between text-lg font-bold items-center">
                      <span class="text-gray-800">Còn lại:</span>
                      <span class="text-lg font-bold text-orange-600">{{
                        formatPrice(remainingDepositAmount)
                      }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <!-- Transaction View -->
          <!-- <template v-else-if="type === 'transaction'">
                         Transaction Information -->
          <!-- <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Mã giao dịch:</label>
                                <p class="text-gray-900 font-medium">{{ data.payment_id || 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Mã đơn hàng:</label>
                                <p class="text-gray-900">#{{ data.order_id || 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Phương thức thanh toán:</label>
                                <p class="text-gray-900">{{ data.method || 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Trạng thái:</label>
                                <span :class="getTransactionStatusClass(data.status)"
                                    class="px-3 py-1 rounded text-sm font-medium">
                                    {{ data.status || 'N/A' }}
                                </span>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Số tiền:</label>
                                <p class="text-gray-900 font-semibold text-green-600">{{ formatPrice(data.amount || 0)
                                    }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-700">Ngày tạo:</label>
                                <p class="text-gray-900">{{ data.payment_date || 'N/A' }}</p>
                            </div>
                        </div> -->

          <!-- Order Summary (nếu có thông tin đơn hàng) -->
          <!-- <div v-if="data.order" class="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 class="text-lg font-bold text-gray-800 mb-3">Thông tin đơn hàng liên quan</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="text-sm font-semibold text-gray-700">Tổng giá trị đơn hàng:</label>
                                    <p class="text-gray-900 font-medium">{{ formatPrice(data.order.final_total ||
                                        data.order.total || 0) }}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-700">Trạng thái đơn hàng:</label>
                                    <p class="text-gray-900">{{ data.order.status || 'N/A' }}</p>
                                </div>
                            </div>
                        </div> -->

          <!-- Deposit Information -->
          <!-- <div v-if="data.order?.deposit_required" class="mt-4 p-4 border-t">
                            <h3 class="text-lg font-bold text-gray-800 mb-3">Thông tin đặt cọc</h3>

                            <div class="mb-3">
                                <span class="text-sm font-semibold text-gray-700">Trạng thái đặt cọc: </span>
                                <span :class="[
                                    'inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2',
                                    data.order.deposit?.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                ]">
                                    {{ data.order.deposit?.paid ? 'Đã đặt cọc' : 'Chưa đặt cọc' }}
                                </span>
                            </div> -->

          <!-- Thông tin chi tiết khi đã đặt cọc -->
          <!-- <div v-if="data.order.deposit?.paid"
                                class="bg-green-50 border-l-4 border-green-400 p-4 rounded space-y-2">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <p class="text-sm font-semibold text-green-800">Đã đặt cọc thành công</p>
                                </div>

                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700">Số tiền đã đặt cọc:</span>
                                        <span class="font-semibold text-green-600">{{
                                            formatPrice(data.order.deposit?.amount || 0) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700">Tổng giá trị đơn hàng:</span>
                                        <span class="font-semibold text-gray-800">{{ formatPrice(data.order.final_total
                                            || 0) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center pt-2 border-t border-green-200">
                                        <span class="font-semibold text-gray-800">Số tiền còn lại phải thanh
                                            toán:</span>
                                        <span class="text-lg font-bold text-orange-600">{{
                                            formatPrice(remainingDepositAmount) }}</span>
                                    </div>
                                </div>

                                <p class="text-xs text-green-700 mt-2">
                                    Số tiền còn lại sẽ được thanh toán khi khách hàng nhận hàng.
                                </p>
                            </div> -->

          <!-- Thông tin khi chưa đặt cọc -->
          <!-- <div v-else-if="data.order.deposit"
                                class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700">Số tiền cần đặt cọc:</span>
                                        <span class="font-semibold text-yellow-600">{{
                                            formatPrice(data.order.deposit?.amount || 0) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700">Tổng giá trị đơn hàng:</span>
                                        <span class="font-semibold text-gray-800">{{ formatPrice(data.order.final_total
                                            || 0) }}</span>
                                    </div>
                                </div>
                            </div> -->
          <!-- </div>
                    </template> -->
        </div>
        <div v-else class="text-center text-gray-500 py-8">Không có dữ liệu để hiển thị</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { X } from "lucide-vue-next"

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "order",
    validator: (value) => ["order", "transaction"].includes(value),
  },
  data: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(["close"])

const handleClose = () => {
  emit("close")
}

const formatPrice = (price) => {
  if (!price && price !== 0) return "0 ₫"
  const numPrice = typeof price === "string" ? parseFloat(price.replace(/[^\d.]/g, "")) : price
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice)
}

// Tính special discount amount (discount từ mã giảm giá)
const specialDiscountAmount = computed(() => {
  if (props.type !== "order" || !props.data) return 0

  // Nếu có auto_discount_amount và discount_amount, thì discount_amount là special discount
  if (props.data.auto_discount_amount && props.data.discount_amount) {
    // discount_amount có thể là tổng hoặc chỉ special, cần kiểm tra
    // Nếu có total_discount_amount, thì special = total - auto
    if (props.data.total_discount_amount) {
      return props.data.total_discount_amount - (props.data.auto_discount_amount || 0)
    }
    // Nếu không có total_discount_amount, giả sử discount_amount là special
    return props.data.discount_amount
  }
  // Nếu không có auto discount, thì discount_amount là special discount
  return props.data.discount_amount || 0
})

// Tính số tiền còn lại phải thanh toán sau khi đặt cọc
// Tính tay: final_total - deposit.amount
const remainingDepositAmount = computed(() => {
  if (props.type === "order") {
    if (!props.data) {
      return 0
    }
    const finalTotal = props.data.final_total || 0
    const depositAmount = props.data.deposit?.amount || 0

    // Tính số tiền còn lại = final_total - deposit.amount
    const remaining = finalTotal - depositAmount
    return remaining > 0 ? remaining : 0
  } else if (props.type === "transaction") {
    if (!props.data?.order) {
      return 0
    }
    const finalTotal = props.data.order.final_total || 0
    const depositAmount = props.data.order.deposit?.amount || 0

    // Tính số tiền còn lại = final_total - deposit.amount
    const remaining = finalTotal - depositAmount
    return remaining > 0 ? remaining : 0
  }
  return 0
})

// const getTransactionStatusClass = (status) => {
//     const classMap = {
//         'PROCESSING': 'bg-yellow-100 text-yellow-800',
//         'SUCCESS': 'bg-green-100 text-green-800',
//         'FAILED': 'bg-red-100 text-red-800',
//         'Đang xử lý': 'bg-yellow-100 text-yellow-800',
//         'Thành công': 'bg-green-100 text-green-800',
//         'Thất bại': 'bg-red-100 text-red-800'
//     }
//     return classMap[status] || 'bg-gray-100 text-gray-800'
// }
</script>
