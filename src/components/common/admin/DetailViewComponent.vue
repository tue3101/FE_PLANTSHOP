<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent class="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <DialogHeader class="flex p-6 border-b bg-muted">
        <div class="flex w-full">
          <DialogTitle class="text-2xl font-bold">
            {{
              type === "order"
                ? `Chi tiết đơn #${data?.order_id || ""}`
                : `Chi tiết giao dịch #${data?.payment_id || ""}`
            }}
          </DialogTitle>
        </div>
      </DialogHeader>

      <div class="p-6">
        <div v-if="data">
          <!-- Order View -->
          <template v-if="type === 'order'">
            <!-- Customer Information -->
            <Card class="mb-6">
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label class="text-lg font-semibold">Tên khách hàng:</Label>
                    <p class="text-muted-foreground font-medium">{{ data.customer || "Không có" }}</p>
                  </div>

                  <div>
                    <Label class="text-lg font-semibold">Số điện thoại:</Label>
                    <p class="text-muted-foreground">{{ data.phone || "Không có" }}</p>
                  </div>
                  <div>
                    <Label class="text-lg font-semibold">Địa chỉ:</Label>
                    <p class="text-muted-foreground">{{ data.address || "Không có" }}</p>
                  </div>

                  <div>
                    <Label class="text-lg font-semibold">Ngày đặt:</Label>
                    <p class="text-muted-foreground">{{ data.created_at || "Không có" }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Product Details Table -->
            <div class="mb-4">
              <div class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã sản phẩm</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead class="text-center">Số lượng</TableHead>
                      <TableHead class="text-center">Đơn giá</TableHead>
                      <TableHead class="text-center">Tạm tính</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-if="!data.order_details || data.order_details.length === 0">
                      <TableCell colspan="5" class="text-center text-muted-foreground">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                    <TableRow
                      v-for="(detail, index) in data.order_details"
                      :key="index"
                      class="hover:bg-muted/50"
                    >
                      <TableCell>
                        {{ detail.product_id || detail.product?.product_id || "N/A" }}
                      </TableCell>
                      <TableCell>
                        {{ detail.product_name || detail.product?.product_name || "N/A" }}
                      </TableCell>
                      <TableCell class="text-center">{{ detail.quantity || 0 }}</TableCell>
                      <TableCell class="text-center">
                        {{ formatPrice(detail.price_at_order || detail.price || 0) }}
                      </TableCell>
                      <TableCell class="text-center font-semibold">
                        {{
                          formatPrice(
                            (detail.price_at_order || detail.price || 0) * (detail.quantity || 0)
                          )
                        }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <!-- Order Summary -->
            <Card class="mt-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="mb-4">
                  <Label class="block text-sm font-semibold mb-2">Ghi chú:</Label>
                  <p class="bg-background p-3 rounded border min-h-[60px]">
                    {{ data.note || "Không có" }}
                  </p>
                </div>
                <div class="flex justify-end">
                  <div class="w-full md:w-1/2 space-y-2">
                    <div class="flex justify-between text-sm pt-4">
                      <span class="text-muted-foreground">Tạm tính:</span>
                      <span class="font-medium">{{ formatPrice(data.total || 0) }}</span>
                    </div>
                    <div
                      v-if="
                        data.discount > 0 || data.discount_amount > 0 || data.auto_discount_amount > 0
                      "
                      class="space-y-1"
                    >
                      <!-- Auto Discount -->
                      <div v-if="data.auto_discount_amount > 0" class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Giảm giá tự động:</span>
                        <span class="text-green-600 font-medium"
                          >-{{ formatPrice(data.auto_discount_amount || 0) }}</span
                        >
                      </div>
                      <!-- Special Discount (from discount code) -->
                      <div v-if="specialDiscountAmount > 0" class="flex justify-between text-sm">
                        <span class="text-muted-foreground">
                          Giảm giá
                          <span v-if="data.discount_code">({{ data.discount_code }})</span>:
                        </span>
                        <span class="text-red-600 font-medium">-{{ formatPrice(specialDiscountAmount) }}</span>
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
                        <span class="text-muted-foreground">
                          Giảm giá
                          <span v-if="data.discount_code">({{ data.discount_code }})</span>:
                        </span>
                        <span class="text-red-600 font-medium"
                          >-{{ formatPrice(data.discount || data.discount_amount || 0) }}</span
                        >
                      </div>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Phí vận chuyển:</span>
                      <span class="font-medium">{{ formatPrice(data.shipping_fee || 0) }}</span>
                    </div>

                    <!-- Chỉ hiển thị đặt cọc khi đã đặt cọc thành công (paid = true) -->
                    <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                      <div class="flex justify-between text-sm items-center">
                        <span class="text-muted-foreground">Đã đặt cọc:</span>
                        <span class="font-semibold text-green-600">{{
                          formatPrice(data.deposit?.amount || 0)
                        }}</span>
                      </div>
                    </template>

                    <div class="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span>Tổng cộng:</span>
                      <span class="text-green-600">{{ formatPrice(data.final_total || 0) }}</span>
                    </div>

                    <!-- Deposit Information - Chỉ hiển thị khi đã đặt cọc thành công -->
                    <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                      <div class="flex justify-between text-lg font-bold items-center">
                        <span>Còn lại:</span>
                        <span class="text-lg font-bold text-orange-600">{{
                          formatPrice(remainingDepositAmount)
                        }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>
        </div>
        <div v-else class="text-center text-muted-foreground py-8">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { X } from "lucide-vue-next"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const props = withDefaults(defineProps<{
  show?: boolean
  type?: "order" | "transaction"
  data?: Record<string, unknown> | null
}>(), {
  show: false,
  type: "order",
  data: null,
})

const emit = defineEmits<{
  close: []
}>()

const handleOpenChange = (open: boolean): void => {
  if (!open) {
    handleClose()
  }
}

const handleClose = (): void => {
  emit("close")
}

const formatPrice = (price: number | string | undefined): string => {
  if (!price && price !== 0) return "0 ₫"
  const numPrice = typeof price === "string" ? parseFloat(price.replace(/[^\d.]/g, "")) : price
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice || 0)
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
</script>
