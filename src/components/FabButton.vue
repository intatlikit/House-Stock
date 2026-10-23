<script setup lang="ts">
// ปุ่มลอยกลม ใช้ภายใน FabGroup (FabGroup เป็นตัวจัดตำแหน่งมุมขวาล่าง)
// primary = ปุ่มหลักสีเขียว, secondary = ปุ่มรองพื้นเข้ม ขอบเขียว
withDefaults(
  defineProps<{
    label: string
    icon?: string
    variant?: 'primary' | 'secondary'
  }>(),
  { icon: '+', variant: 'primary' },
)
defineEmits<{ click: [] }>()
</script>

<template>
  <!-- จอเล็กแสดงแค่ไอคอน, จอใหญ่แสดงข้อความด้วย -->
  <button
    type="button"
    class="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold shadow-lg shadow-black/30 transition active:scale-95"
    :class="
      variant === 'primary'
        ? 'bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary-dark)]'
        : 'border border-[var(--color-primary)] bg-[var(--color-surface-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
    "
    :aria-label="label"
    :title="label"
    @click="$emit('click')"
  >
    <span class="text-2xl leading-none" aria-hidden="true">{{ icon }}</span>
    <span class="hidden sm:inline">{{ label }}</span>
  </button>
</template>
