<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'

withDefaults(
  defineProps<{
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  { confirmLabel: 'ยืนยัน', cancelLabel: 'ยกเลิก', danger: true },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :title="title" max-width="max-w-sm" @close="emit('cancel')">
    <p class="text-sm text-[var(--color-text-muted)]">{{ message }}</p>

    <div class="mt-6 flex justify-end gap-3">
      <button
        type="button"
        class="rounded-[var(--radius-control)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        class="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-white"
        :class="danger ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </div>
  </BaseModal>
</template>
