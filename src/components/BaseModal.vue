<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    maxWidth?: string
  }>(),
  { maxWidth: 'max-w-lg' },
)

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#2E332F]/40 p-4"
      @click.self="emit('close')"
    >
      <div
        class="w-full rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-xl"
        :class="maxWidth"
      >
        <div v-if="title || $slots.header" class="mb-4 flex items-start justify-between gap-4">
          <slot name="header">
            <h2 class="text-lg font-semibold text-[var(--color-text)]">{{ title }}</h2>
          </slot>
          <button
            type="button"
            class="rounded-full p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
            aria-label="ปิด"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <slot />
      </div>
    </div>
  </Teleport>
</template>
