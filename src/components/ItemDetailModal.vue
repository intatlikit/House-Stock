<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'
import type { ItemWithRelations } from '@/types'

defineProps<{ item: ItemWithRelations }>()
const emit = defineEmits<{ close: [] }>()

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'ไม่ระบุ'
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <BaseModal :title="item.name" max-width="max-w-md" @close="emit('close')">
    <dl class="grid grid-cols-2 gap-y-3 text-sm">
      <dt class="text-[var(--color-text-muted)]">ประเภท</dt>
      <dd class="font-medium">{{ item.tag?.name ?? 'ไม่ระบุ' }}</dd>

      <dt class="text-[var(--color-text-muted)]">จำนวน</dt>
      <dd class="font-medium">{{ item.quantity }}</dd>

      <dt class="text-[var(--color-text-muted)]">วันหมดอายุ</dt>
      <dd class="font-medium">{{ formatDate(item.expiry_date) }}</dd>

      <dt class="text-[var(--color-text-muted)]">ราคา</dt>
      <dd class="font-medium">{{ item.price != null ? `${item.price.toLocaleString()} บาท` : 'ไม่ระบุ' }}</dd>

      <dt class="text-[var(--color-text-muted)]">สถานที่ที่ซื้อ</dt>
      <dd class="font-medium">{{ item.location?.name ?? 'ไม่ระบุ' }}</dd>

      <dt class="text-[var(--color-text-muted)]">เพิ่มเมื่อ</dt>
      <dd class="font-medium">{{ formatDateTime(item.created_at) }}</dd>
    </dl>
  </BaseModal>
</template>
