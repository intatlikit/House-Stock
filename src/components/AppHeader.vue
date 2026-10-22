<script setup lang="ts">
import { APP_VERSION } from '@/lib/version'
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur sm:px-6"
  >
    <slot name="left">
      <h1 class="text-base font-semibold text-[var(--color-text)]">House Stock</h1>
    </slot>

    <div class="flex items-center gap-3">
      <slot name="actions" />
      <span
        class="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]"
      >
        v{{ APP_VERSION }}
      </span>
    </div>
  </header>
</template>
