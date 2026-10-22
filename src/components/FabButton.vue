<script setup lang="ts">
defineProps<{ label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <!-- ปุ่มลอยมุมขวาล่าง: จอเล็กแสดงแค่ "+", จอใหญ่แสดงข้อความด้วย -->
  <button
    type="button"
    class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-bg)] shadow-lg shadow-black/30 transition hover:bg-[var(--color-primary-dark)] active:scale-95 sm:right-6"
    :aria-label="label"
    :title="label"
    @click="$emit('click')"
  >
    <span class="text-2xl leading-none" aria-hidden="true">+</span>
    <span class="hidden sm:inline">{{ label }}</span>
  </button>
</template>
