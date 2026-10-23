<script setup lang="ts">
import { ref, watch } from 'vue'

// min / max ไม่ใส่ = ไม่ต่ำกว่า 0 และไม่จำกัดค่าสูงสุด
const props = withDefaults(
  defineProps<{
    quantity: number
    min?: number
    max?: number
  }>(),
  { min: 0, max: Infinity },
)

const emit = defineEmits<{
  change: [quantity: number]
}>()

// ค่าที่กำลังพิมพ์อยู่ในช่อง — sync กลับเมื่อจำนวนจริงเปลี่ยน (เช่น กด +/- หรือแก้จาก modal)
const draft = ref(String(props.quantity))
watch(
  () => props.quantity,
  (value) => {
    draft.value = String(value)
  },
)

function update(value: number) {
  const next = Math.min(props.max, Math.max(props.min, value))
  if (next === props.quantity) {
    draft.value = String(props.quantity)
    return
  }
  emit('change', next)
}

// commit ตอน blur / กด Enter — ถ้าพิมพ์ไม่ใช่ตัวเลขให้คืนค่าเดิม
function commitDraft() {
  const value = Number(draft.value)
  if (draft.value.trim() === '' || Number.isNaN(value)) {
    draft.value = String(props.quantity)
    return
  }
  update(value)
}

const buttonClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
  <div class="flex items-center gap-1.5">
    <button
      type="button"
      :class="buttonClass"
      aria-label="ลดจำนวน"
      :disabled="quantity <= min"
      @click="update(quantity - 1)"
    >
      −
    </button>
    <input
      v-model="draft"
      type="text"
      inputmode="decimal"
      aria-label="จำนวน"
      class="w-12 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 py-1 text-center text-sm"
      @focus="($event.target as HTMLInputElement).select()"
      @blur="commitDraft"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
    />
    <button
      type="button"
      :class="buttonClass"
      aria-label="เพิ่มจำนวน"
      :disabled="quantity >= max"
      @click="update(quantity + 1)"
    >
      +
    </button>
  </div>
</template>
