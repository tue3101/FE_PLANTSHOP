<template>
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50"
        @click.self="$emit('cancel')">
        <div class="bg-white rounded-lg shadow-lg p-6 w-96">
            <!-- Confirm Mode -->
            <template v-if="mode === 'confirm'">
                <h3 class="text-lg font-semibold mb-4">Xác nhận xóa</h3>
                <p class="mb-6">{{ message || 'Bạn có chắc chắn muốn xóa không?' }}</p>
                <div class="flex justify-end space-x-4">
                    <button @click="cancel"
                        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">Hủy</button>
                    <button @click="confirm"
                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">Xóa</button>
                </div>
            </template>

            <!-- Success Mode -->
            <template v-else-if="mode === 'success'">
                <h3 class="text-lg font-semibold mb-4 text-green-600">Xóa thành công</h3>
                <p class="mb-6">Mục đã được xóa thành công.</p>
                <div class="flex justify-end">
                    <button @click="close"
                        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">Đóng</button>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: "DeleteModal",
    props: {
        showModal: {
            type: Boolean,
            required: true
        },
        mode: {
            type: String,
            default: 'confirm',
            validator: (value) => ['confirm', 'success'].includes(value)
        },
        message: {
            type: String,
            default: ''
        }
    },
    emits: ["confirm", "cancel", "close"],
    methods: {
        confirm() {
            this.$emit("confirm");
        },
        cancel() {
            this.$emit("cancel");
        },
        close() {
            this.$emit("close");
        }
    }
};

</script>
