<script setup lang="ts">
import type { House } from '@/types'
import ChipButton from '@/components/ChipButton.vue'

// หัวข้อ + ปุ่มเลือกบ้านทีละหลัง — selectedId = บ้านที่เลือกอยู่ (ว่าง = ยังไม่เลือก)
defineProps<{
  label: string
  houses: House[]
  selectedId: string
}>()

const emit = defineEmits<{ select: [houseId: string] }>()
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-medium text-[var(--color-text-muted)]">{{ label }}</p>
    <div class="flex flex-wrap gap-2">
      <ChipButton v-for="h in houses" :key="h.id" :active="selectedId === h.id" @click="emit('select', h.id)">
        {{ h.name }}
      </ChipButton>
    </div>
  </div>
</template>
