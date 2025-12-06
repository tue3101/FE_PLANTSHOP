<template>
  <div class="overflow-x-auto mb-10">
    <h2 :class="titleClass">{{ title }}</h2>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted">
            <TableHead
              v-for="(header, index) in headers"
              :key="index"
              class="px-2 py-2 text-left font-bold"
            >
              {{ header }}
            </TableHead>
            <TableHead v-if="hasActions" class="px-2 py-2 text-left font-bold">
              {{ actionsLabel }}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="data.length === 0">
            <TableRow>
              <TableCell
                :colspan="headers.length + (hasActions ? 1 : 0)"
                class="px-2 py-12"
              >
                <slot name="empty">
                  <div class="flex flex-col items-center justify-center text-center">
                    <p class="text-muted-foreground">Danh sách trống</p>
                  </div>
                </slot>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow
              v-for="row in data"
              :key="(row as any)[rowKey]"
              class="hover:bg-muted/50 transition"
              :class="rowClass"
            >
              <!-- Cột dữ liệu -->
              <TableCell
                v-for="(key, index) in keys"
                :key="index"
                class="px-2 py-2"
              >
                <!--slot là một điểm chèn nội dung động-->
                <slot :name="`cell-${key}`" :item="row" :value="(row as any)[key]">
                  {{ (row as any)[key] }}
                </slot>
              </TableCell>

              <!-- Cột chức năng -->
              <TableCell v-if="hasActions" class="px-2 py-2 space-x-2">
                <slot name="actions" :item="row"></slot>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

withDefaults(defineProps<{
  title?: string
  headers?: string[]
  keys?: string[]
  data?: unknown[]
  actionsLabel?: string
  rowKey?: string
  rowClass?: string
  titleClass?: string
}>(), {
  title: "",
  headers: () => [],
  keys: () => [],
  data: () => [],
  actionsLabel: "CHỨC NĂNG",
  rowKey: "id",
  rowClass: "h-16",
  titleClass: "font-bold text-2xl pt-10 pb-4",
})

//lấy list slot từ cha và check coi có action ko
const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>
