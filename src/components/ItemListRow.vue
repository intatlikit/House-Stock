<script setup lang="ts">
import type { ItemWithRelations } from '@/types'

// แถวสิ่งของแบบกดเลือกได้: ชื่อซ้าย, tag / จำนวน / วันหมดอายุขวา
defineProps<{
  item: ItemWithRelations
  selected?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      selected
        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
        : 'border-transparent bg-[var(--color-surface-muted)] enabled:hover:border-[var(--color-primary)]'
    "
    @click="emit('click')"
  >
    <span class="min-w-0 truncate font-medium text-[var(--color-text)]">{{ item.name }}</span>
    <span class="flex shrink-0 items-center gap-2 text-xs text-[var(--color-text-muted)]">
      <span
        v-if="item.tag"
        class="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[var(--color-primary-dark)]"
      >
        {{ item.tag.name }}
      </span>
      <span>×{{ item.quantity }}</span>
      <span v-if="item.expiry_date">{{ formatDate(item.expiry_date) }}</span>
    </span>
  </button>
</template>
