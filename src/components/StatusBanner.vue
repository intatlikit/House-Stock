<script setup lang="ts">
// แถบแจ้งผลการทำงาน (สำเร็จ / ผิดพลาด) พร้อมปุ่ม ✕ ปิด
defineProps<{
  message: string
  tone: 'success' | 'error'
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div
    class="flex items-start justify-between gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm"
    :class="
      tone === 'success'
        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
        : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'
    "
    role="status"
  >
    <span>{{ message }}</span>
    <button type="button" class="shrink-0 opacity-70 hover:opacity-100" aria-label="ปิด" @click="emit('close')">
      ✕
    </button>
  </div>
</template>
