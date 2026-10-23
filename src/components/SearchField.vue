<script setup lang="ts">
import ClearableField from '@/components/ClearableField.vue'

// ช่องค้นหาพร้อมไอคอน 🔍 และปุ่ม ✕ ล้างคำค้น
defineProps<{ placeholder?: string }>()

const query = defineModel<string>({ required: true })
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-4 shadow-sm"
  >
    <span class="text-sm" aria-hidden="true">🔍</span>
    <ClearableField class="flex-1" :show="Boolean(query)" @clear="query = ''">
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full bg-transparent py-2.5 pr-3 text-sm focus:outline-none"
      />
    </ClearableField>
  </div>
</template>
