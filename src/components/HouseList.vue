<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { House } from '@/types'
import { useHouses } from '@/composables/useHouses'
import HouseCard from '@/components/HouseCard.vue'

const props = defineProps<{ houses: House[] }>()

const { reorderHouses } = useHouses()

/*
  ลากจัดลำดับด้วย Pointer Events แทน HTML5 drag & drop
  เพราะ HTML5 DnD ใช้กับ touch บนมือถือ (เช่น Safari iOS) ไม่ได้ — Pointer Events รองรับทั้งเมาส์และนิ้ว
  ลากได้เฉพาะจาก handle (⠿) ที่มี data-drag-handle เพื่อไม่ให้แย่งกับการ scroll หน้าและการกดเข้าบ้าน
*/
const draggingId = ref<string | null>(null)
const dragOrder = ref<House[] | null>(null)

// ระหว่างลากแสดงลำดับชั่วคราว, ปล่อยแล้วกลับไปใช้ props
const displayed = computed(() => dragOrder.value ?? props.houses)

function onPointerDown(e: PointerEvent, id: string) {
  if (!(e.target as HTMLElement).closest('[data-drag-handle]')) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  e.preventDefault()

  draggingId.value = id
  dragOrder.value = [...props.houses]
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!draggingId.value || !dragOrder.value) return
  const target = document
    .elementFromPoint(e.clientX, e.clientY)
    ?.closest<HTMLElement>('[data-house-id]')
  const targetId = target?.dataset.houseId
  if (!targetId || targetId === draggingId.value) return

  const order = dragOrder.value
  const fromIndex = order.findIndex((h) => h.id === draggingId.value)
  const toIndex = order.findIndex((h) => h.id === targetId)
  if (fromIndex === -1 || toIndex === -1) return

  const next = [...order]
  next.splice(toIndex, 0, next.splice(fromIndex, 1)[0])
  dragOrder.value = next
}

async function onPointerUp() {
  removeListeners()
  const order = dragOrder.value
  draggingId.value = null
  dragOrder.value = null
  if (!order) return

  const ids = order.map((h) => h.id)
  const changed = ids.some((id, i) => id !== props.houses[i]?.id)
  if (changed) await reorderHouses(ids)
}

function removeListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

onBeforeUnmount(removeListeners)
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" :class="{ 'select-none': draggingId }">
    <div
      v-for="house in displayed"
      :key="house.id"
      :data-house-id="house.id"
      class="transition-opacity"
      :class="{ 'opacity-50': draggingId === house.id }"
      @pointerdown="onPointerDown($event, house.id)"
    >
      <HouseCard :house="house" />
    </div>
  </div>

  <p v-if="!houses.length" class="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
    ยังไม่มีบ้านในระบบ กดปุ่ม "เพิ่มบ้าน" เพื่อเริ่มต้น
  </p>
</template>
