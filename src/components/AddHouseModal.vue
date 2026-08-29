<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useHouses } from '@/composables/useHouses'

const emit = defineEmits<{ close: [] }>()

const { addHouse } = useHouses()
const name = ref('')
const isSubmitting = ref(false)

async function submit() {
  const trimmed = name.value.trim()
  if (!trimmed || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await addHouse(trimmed)
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal title="เพิ่มบ้านใหม่" max-width="max-w-sm" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <input
        v-model="name"
        type="text"
        autofocus
        placeholder="ชื่อบ้าน เช่น บ้านหลัก, คอนโด"
        class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        :disabled="!name.trim() || isSubmitting"
        class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        เพิ่มบ้าน
      </button>
    </form>
  </BaseModal>
</template>
