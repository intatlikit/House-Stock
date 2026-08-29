<script setup lang="ts">
import { ref } from 'vue'
import type { House } from '@/types'
import { useHouses } from '@/composables/useHouses'
import HouseCard from '@/components/HouseCard.vue'

defineProps<{ houses: House[] }>()

const { reorderHouses } = useHouses()
const draggingId = ref<string | null>(null)

function onDragStart(id: string) {
  draggingId.value = id
}

async function onDrop(targetId: string, currentOrder: House[]) {
  const dragId = draggingId.value
  draggingId.value = null
  if (!dragId || dragId === targetId) return

  const ids = currentOrder.map((h) => h.id)
  const fromIndex = ids.indexOf(dragId)
  const toIndex = ids.indexOf(targetId)
  if (fromIndex === -1 || toIndex === -1) return

  ids.splice(toIndex, 0, ids.splice(fromIndex, 1)[0])
  await reorderHouses(ids)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="house in houses"
      :key="house.id"
      draggable="true"
      @dragstart="onDragStart(house.id)"
      @dragover.prevent
      @drop="onDrop(house.id, houses)"
    >
      <HouseCard :house="house" />
    </div>
  </div>

  <p v-if="!houses.length" class="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
    ยังไม่มีบ้านในระบบ กดปุ่ม "เพิ่มบ้าน" เพื่อเริ่มต้น
  </p>
</template>
