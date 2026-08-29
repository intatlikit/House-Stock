<script setup lang="ts">
import type { ItemWithRelations, SortState, SortColumn } from '@/types'

const props = defineProps<{
  items: ItemWithRelations[]
  sort: SortState | null
}>()

const emit = defineEmits<{
  sort: [column: SortColumn]
  view: [item: ItemWithRelations]
  edit: [item: ItemWithRelations]
  delete: [item: ItemWithRelations]
}>()

const columns: { key: SortColumn; label: string }[] = [
  { key: 'index', label: '#' },
  { key: 'name', label: 'ชื่อสิ่งของ' },
  { key: 'tag', label: 'ประเภท' },
  { key: 'quantity', label: 'จำนวน' },
  { key: 'expiry_date', label: 'วันหมดอายุ' },
]

function sortIndicator(column: SortColumn) {
  if (props.sort?.column !== column) return ''
  return props.sort.direction === 'asc' ? '▲' : '▼'
}

function isExpiringSoon(dateStr: string | null) {
  if (!dateStr) return false
  const diffDays = (new Date(dateStr).getTime() - Date.now()) / 86_400_000
  return diffDays >= 0 && diffDays <= 7
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr).getTime() < Date.now()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="table-scroll rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          <th
            v-for="col in columns"
            :key="col.key"
            class="cursor-pointer select-none whitespace-nowrap px-4 py-3 hover:text-[var(--color-text)]"
            @click="col.key !== 'index' && emit('sort', col.key)"
          >
            {{ col.label }} <span class="text-[var(--color-primary)]">{{ sortIndicator(col.key) }}</span>
          </th>
          <th class="whitespace-nowrap px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="item.id"
          class="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]"
          @click="emit('view', item)"
        >
          <td class="whitespace-nowrap px-4 py-3 text-[var(--color-text-muted)]">{{ index + 1 }}</td>
          <td class="whitespace-nowrap px-4 py-3 font-medium">{{ item.name }}</td>
          <td class="whitespace-nowrap px-4 py-3">
            <span
              v-if="item.tag"
              class="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs text-[var(--color-primary-dark)]"
            >
              {{ item.tag.name }}
            </span>
            <span v-else class="text-[var(--color-text-muted)]">—</span>
          </td>
          <td class="whitespace-nowrap px-4 py-3">{{ item.quantity }}</td>
          <td class="whitespace-nowrap px-4 py-3">
            <span
              :class="{
                'text-[var(--color-danger)] font-semibold': isExpired(item.expiry_date),
                'text-[var(--color-warning)] font-semibold': isExpiringSoon(item.expiry_date),
              }"
            >
              {{ formatDate(item.expiry_date) }}
            </span>
          </td>
          <td class="whitespace-nowrap px-4 py-3" @click.stop>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                aria-label="แก้ไข"
                @click="emit('edit', item)"
              >
                ✎
              </button>
              <button
                type="button"
                class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]"
                aria-label="ลบ"
                @click="emit('delete', item)"
              >
                🗑
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!items.length" class="p-8 text-center text-sm text-[var(--color-text-muted)]">
      ยังไม่มีสิ่งของในบ้านนี้
    </p>
  </div>
</template>
