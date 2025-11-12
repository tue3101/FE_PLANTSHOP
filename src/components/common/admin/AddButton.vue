<template>
    <button @click="$emit('click')"
        class="ml-4 text-3xl text-black border-2 border-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:cursor-pointer transition-colors duration-200"
        :title="title">
        <Plus :size="24" />
    </button>
</template>

<script setup>
import { Plus } from 'lucide-vue-next'

defineProps({
    title: {
        type: String
    }
})

defineEmits(['click'])
</script>
