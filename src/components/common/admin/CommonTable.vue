<template>
  <div class="overflow-x-auto mb-10">
    <h2 :class="titleClass">{{ title }}</h2>
    <table class="w-full border border-gray-500">
      <thead>
        <tr class="bg-gray-400">
          <th v-for="(header, index) in headers" :key="index"
            class="border border-gray-500 px-2 py-2 text-left font-bold">
            {{ header }}
          </th>
          <th v-if="hasActions" class="border border-gray-500 px-2 py-2 text-left font-bold">
            {{ actionsLabel }}
          </th>
        </tr>
      </thead>

      <tbody>
        <template v-if="data.length === 0">
          <!-- colspan dùng để gộp các cột lại -->
          <tr> 
            <td :colspan="headers.length + (hasActions ? 1 : 0)" class="border border-gray-500 px-2 py-12">
              <slot name="empty">
                <div class="flex flex-col items-center justify-center text-center">
                  <p class="text-gray-500">Danh sách trống</p>
                </div>
              </slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="row in data" :key="row[rowKey]" class="bg-gray-300 hover:bg-gray-200 transition" :class="rowClass">
            <!-- Cột dữ liệu -->
            <td v-for="(key, index) in keys" :key="index" class="border border-gray-500 px-2 py-2">
            <!--slot là một điểm chèn nội dung động-->
              <slot :name="`cell-${key}`" :item="row" :value="row[key]">
                {{ row[key] }}
              </slot>
            </td>

            <!-- Cột chức năng -->
            <td v-if="hasActions" class="border border-gray-500 px-2 py-2 space-x-2 ">
              <slot name="actions" :item="row"></slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

defineProps({
  title: { type: String, default: '' },
  headers: { type: Array, default: () => [] },
  keys: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  actionsLabel: { type: String, default: 'CHỨC NĂNG' },
  rowKey: { type: String, default: 'id' },
  rowClass: { type: String, default: 'h-16' },
  titleClass: { type: String, default: 'font-bold text-2xl pt-10 pb-4' },
})

//lấy list slot từ cha và check coi có action ko
const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>
