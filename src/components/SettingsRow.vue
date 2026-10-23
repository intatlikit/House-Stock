<script setup lang="ts">
// แถวเมนูหนึ่งแถวใน SettingsSection: ชื่อเมนูซ้าย, ค่าหรือตัวควบคุม (เช่น toggle) ขวา
// แสดงค่าเฉยๆ ใช้ prop value, ถ้าต้องมีตัวควบคุมให้ใส่ใน slot แทน
// เมนูที่กดแล้วไปหน้าอื่น ใส่ clickable จะมีลูกศร › และส่ง @click ให้ parent นำทางเอง
defineProps<{
  label: string
  value?: string
  clickable?: boolean
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <li class="text-sm">
    <button
      v-if="clickable"
      type="button"
      class="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
      @click="emit('click')"
    >
      <span class="text-[var(--color-text)]">{{ label }}</span>
      <span class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span v-if="value">{{ value }}</span>
        <span class="text-lg leading-none" aria-hidden="true">›</span>
      </span>
    </button>
    <div v-else class="flex items-center justify-between gap-4 px-4 py-3">
      <span class="text-[var(--color-text)]">{{ label }}</span>
      <slot>
        <span v-if="value" class="text-[var(--color-text-muted)]">{{ value }}</span>
      </slot>
    </div>
  </li>
</template>
