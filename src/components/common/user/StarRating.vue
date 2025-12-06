<template>
  <div class="flex items-center gap-1">
    <Button
      v-for="star in 5"
      :key="star"
      type="button"
      variant="ghost"
      size="icon"
      @click="handleStarClick(star)"
      @mouseenter="hoveredStar = star"
      @mouseleave="hoveredStar = 0"
      class="h-auto w-auto p-0 transition-colors cursor-pointer focus:outline-none"
      :disabled="disabled"
    >
      <svg
        :class="[
          'w-6 h-6 transition-colors',
          star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-300',
          disabled && 'cursor-not-allowed opacity-50',
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
    </Button>
    <span v-if="showLabel" class="ml-2 text-sm text-muted-foreground">
      {{ rating > 0 ? `${rating}/5` : "Chưa đánh giá" }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { Button } from "@/components/ui/button"

interface Props {
  modelValue?: number
  disabled?: boolean
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  disabled: false,
  showLabel: true,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
}>()

const rating = ref<number>(props.modelValue)
const hoveredStar = ref<number>(0)

watch(
  () => props.modelValue,
  (newValue: number) => {
    rating.value = newValue
  }
)

const handleStarClick = (star: number): void => {
  if (props.disabled) return
  rating.value = star
  emit("update:modelValue", star)
}
</script>
