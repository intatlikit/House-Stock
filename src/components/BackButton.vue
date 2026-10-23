<script setup lang="ts">
// ปุ่ม "← ชื่อหน้า" สำหรับ slot left ของ AppHeader — การนำทางให้ parent จัดการเองผ่าน @click
defineProps<{ label: string }>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex min-w-0 items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
    @click="emit('click')"
  >
    ← <span class="truncate font-semibold text-[var(--color-text)]">{{ label }}</span>
  </button>
</template>
