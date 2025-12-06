<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="Email"
        required
        :disabled="isLoading"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="password">Mật khẩu</Label>
      <Input
        id="password"
        v-model="password"
        type="password"
        placeholder="Mật khẩu"
        required
        :disabled="isLoading"
      />
    </div>

    <div>
      <router-link
        to="/forgot-password"
        class="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
      >
        Quên mật khẩu?
      </router-link>
    </div>

    <Button type="submit" :disabled="isLoading" class="w-full">
      <Loader v-if="isLoading" :size="16" class="animate-spin" />
      {{ isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP" }}
    </Button>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertDescription class="text-sm text-center">
        {{ errorMessage }}
      </AlertDescription>
    </Alert>

    <div class="flex items-center justify-center gap-2 mt-2 w-full">
      <Button
        variant="dashed"
        size="icon"
        @click="handleGoogleLogin"
        :disabled="isLoading"
        class="w-full"
      >
        <span class="text-sm text-muted-foreground">HOẶC VỚI</span>
        <img src="/img/google.png" alt="Google" class="w-5 h-5 rounded-full" />
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader } from "lucide-vue-next"

interface Props {
  isLoading?: boolean
  errorMessage?: string
}

interface LoginData {
  email: string
  password: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  errorMessage: "",
})

const emit = defineEmits<{
  login: [data: LoginData]
  "google-login": []
}>()

const email = ref<string>("")
const password = ref<string>("")

const handleSubmit = (): void => {
  emit("login", {
    email: email.value,
    password: password.value,
  })
}

const handleGoogleLogin = (): void => {
  emit("google-login")
}
</script>
