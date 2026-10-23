<script setup lang="ts">
import { useRoute } from 'vue-router'
import SettingsButton from '@/components/SettingsButton.vue'
import { APP_VERSION } from '@/lib/version'

const route = useRoute()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur sm:px-6"
  >
    <div class="flex min-w-0 items-center gap-2">
      <slot name="left">
        <h1 class="text-base font-semibold text-[var(--color-text)]">House Stock</h1>
      </slot>
      <span
        class="shrink-0 rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]"
      >
        v{{ APP_VERSION }}
      </span>
    </div>

    <div class="flex items-center gap-3">
      <slot name="actions" />
      <!-- ปุ่มเปิดหน้าตั้งค่า แสดงทุกหน้ายกเว้นหน้าตั้งค่าเอง -->
      <SettingsButton v-if="route.name !== 'settings'" />
    </div>
  </header>
</template>
