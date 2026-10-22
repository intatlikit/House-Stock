<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// เลื่อนลงมาเกินระยะนี้ (px) ถึงจะแสดงปุ่ม — อยู่บนสุดของจอไม่ต้องแสดง
const SHOW_AFTER = 200

const isVisible = ref(false)

function onScroll() {
  isVisible.value = window.scrollY > SHOW_AFTER
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- วางเหนือ FabButton: bottom = ระยะของ FAB (1.5rem) + ความสูง FAB (3.5rem) + ช่องไฟ 0.75rem, right จัดให้อยู่กึ่งกลาง FAB ทรงกลม -->
  <Transition
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
    enter-active-class="transition duration-200"
    leave-active-class="transition duration-200"
  >
    <button
      v-show="isVisible"
      type="button"
      class="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-[1.375rem] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-lg text-[var(--color-text)] shadow-lg shadow-black/30 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-95 sm:right-[1.875rem]"
      aria-label="กลับขึ้นด้านบน"
      title="กลับขึ้นด้านบน"
      @click="scrollToTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </Transition>
</template>
