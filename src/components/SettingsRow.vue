<script setup lang="ts">
// แถวเมนูหนึ่งแถวใน SettingsSection: ชื่อเมนูซ้าย, ค่าหรือตัวควบคุม (เช่น toggle) ขวา
// แสดงค่าเฉยๆ ใช้ prop value, ถ้าต้องมีตัวควบคุมให้ใส่ใน slot แทน
defineProps<{
  label: string
  value?: string
}>()
</script>

<template>
  <li class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
    <span class="text-[var(--color-text)]">{{ label }}</span>
    <slot>
      <span v-if="value" class="text-[var(--color-text-muted)]">{{ value }}</span>
    </slot>
  </li>
</template>
