<script setup lang="ts">
// ปุ่มทรงแคปซูลสำหรับเลือก / filter (เช่น tag, บ้าน) — active = ถูกเลือกอยู่
defineProps<{ active: boolean }>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="rounded-full border px-3 py-1 text-xs transition"
    :class="
      active
        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary-dark)]'
        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
    "
    :aria-pressed="active"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
