<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ClearableField from '@/components/ClearableField.vue'
import FieldError from '@/components/FieldError.vue'
import { useTags } from '@/composables/useTags'

const emit = defineEmits<{ close: [] }>()

const { addTag, isTagNameTaken } = useTags()
const name = ref('')
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

// เตือนชื่อซ้ำทันทีระหว่างพิมพ์ ไม่ต้องรอกดเพิ่ม
const isDuplicate = computed(() => Boolean(name.value.trim()) && isTagNameTaken(name.value))
const errorMessage = computed(() => (isDuplicate.value ? 'มี tag ชื่อนี้อยู่แล้ว' : submitError.value))

async function submit() {
  const trimmed = name.value.trim()
  if (!trimmed || isDuplicate.value || isSubmitting.value) return
  isSubmitting.value = true
  submitError.value = null
  try {
    await addTag(trimmed)
    emit('close')
  } catch (err) {
    submitError.value = (err as Error).message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal title="เพิ่ม tag ใหม่" max-width="max-w-sm" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <ClearableField :show="Boolean(name)" @clear="name = ''">
          <input
            v-model="name"
            type="text"
            autofocus
            placeholder="ชื่อ tag เช่น อาหาร, ของใช้"
            class="w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm"
            :class="errorMessage ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'"
            @input="submitError = null"
          />
        </ClearableField>
        <FieldError :message="errorMessage" />
      </div>
      <button
        type="submit"
        :disabled="!name.trim() || isDuplicate || isSubmitting"
        class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        เพิ่ม tag
      </button>
    </form>
  </BaseModal>
</template>
