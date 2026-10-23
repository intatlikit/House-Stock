<script setup lang="ts">
import { ref } from 'vue'

// ครอบ <input> ที่พิมพ์ได้ ให้มีปุ่ม ✕ ล้างค่าทางขวา — กฎ: ทุกช่องพิมพ์ต้องใช้ตัวนี้ (ยกเว้นช่องจำนวนที่มี +/-)
// การล้างค่าให้ parent ทำเองผ่าน @clear เพราะแต่ละช่องมีค่าว่างต่างกัน ('' หรือ null)
defineProps<{
  // แสดงปุ่ม ✕ เมื่อช่องมีค่า
  show: boolean
}>()

const emit = defineEmits<{ clear: [] }>()

const root = ref<HTMLElement | null>(null)

function clear() {
  emit('clear')
  // ล้างแล้วให้พิมพ์ต่อได้ทันที
  root.value?.querySelector('input')?.focus()
}
</script>

<template>
  <!-- [&>input]:pr-9 เว้นที่ด้านขวาของ input ให้ปุ่ม ✕ ไม่ทับข้อความ -->
  <div ref="root" class="relative min-w-0 [&>input]:pr-9">
    <slot />
    <button
      v-if="show"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      aria-label="ล้างข้อความ"
      @mousedown.prevent
      @click.stop="clear"
    >
      ✕
    </button>
  </div>
</template>
