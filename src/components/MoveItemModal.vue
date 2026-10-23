<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import QuantityStepper from '@/components/QuantityStepper.vue'
import ItemListRow from '@/components/ItemListRow.vue'
import type { ItemWithRelations } from '@/types'

const props = defineProps<{
  item: ItemWithRelations
  fromHouseName: string
  toHouseName: string
  // ของที่ชื่อตรงกันในบ้านปลายทาง (เรียงแล้ว) — ว่าง = ปลายทางยังไม่มีของชิ้นนี้
  matches: ItemWithRelations[]
}>()

const emit = defineEmits<{
  close: []
  // targetId = ของที่บ้านปลายทางที่จะบวกจำนวนเข้าไป, null = ไปกรอกรายละเอียดเป็นของใหม่
  confirm: [quantity: number, targetId: string | null]
}>()

// เริ่มที่ย้าย 1 ชิ้น (ถ้ามีไม่ถึง 1 เช่น 0.5 ให้ย้ายทั้งหมด)
const quantity = ref(Math.min(1, props.item.quantity))
const targetId = ref<string | null>(props.matches[0]?.id ?? null)
const isSubmitting = ref(false)

const target = computed(() => props.matches.find((m) => m.id === targetId.value) ?? null)
// ปัดทศนิยม 3 ตำแหน่งกันตัวเลขเพี้ยน (เช่น 0.1 + 0.2)
const round = (value: number) => Math.round(value * 1000) / 1000
const remaining = computed(() => round(props.item.quantity - quantity.value))
const merged = computed(() => round((target.value?.quantity ?? 0) + quantity.value))
const canConfirm = computed(() => quantity.value > 0 && quantity.value <= props.item.quantity && !isSubmitting.value)

function confirm() {
  if (!canConfirm.value) return
  isSubmitting.value = true
  emit('confirm', quantity.value, targetId.value)
}
</script>

<template>
  <BaseModal :title="`ย้าย '${item.name}'`" max-width="max-w-md" @close="emit('close')">
    <div class="space-y-4 text-sm">
      <p class="text-[var(--color-text-muted)]">
        จาก <span class="font-semibold text-[var(--color-text)]">{{ fromHouseName }}</span>
        → ไป <span class="font-semibold text-[var(--color-text)]">{{ toHouseName }}</span>
      </p>

      <div>
        <p class="mb-2 text-xs font-medium text-[var(--color-text-muted)]">จำนวนที่จะย้าย (มีอยู่ {{ item.quantity }})</p>
        <div class="flex items-center gap-3">
          <QuantityStepper :quantity="quantity" :max="item.quantity" @change="(q) => (quantity = q)" />
          <button
            type="button"
            class="rounded-full px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            @click="quantity = item.quantity"
          >
            ย้ายทั้งหมด
          </button>
        </div>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">เหลือที่ {{ fromHouseName }}: {{ remaining }}</p>
      </div>

      <!-- ปลายทางมีของชื่อเดียวกัน: บวกจำนวนเข้าไป (มีหลายชิ้นให้เลือกว่าจะรวมกับชิ้นไหน) -->
      <div v-if="matches.length">
        <p
          class="rounded-[var(--radius-control)] bg-[var(--color-primary-light)] px-3 py-2 text-xs text-[var(--color-primary-dark)]"
        >
          {{ toHouseName }} มี "{{ item.name }}" อยู่แล้ว — จะบวกจำนวนเข้าไป ข้อมูลอื่นของปลายทางคงเดิม
          <template v-if="target">(เดิม {{ target.quantity }} → รวม {{ merged }})</template>
        </p>
        <template v-if="matches.length > 1">
          <p class="mt-3 mb-2 text-xs font-medium text-[var(--color-text-muted)]">เลือกชิ้นที่จะรวม</p>
          <ul class="space-y-1">
            <li v-for="match in matches" :key="match.id">
              <ItemListRow :item="match" :selected="targetId === match.id" @click="targetId = match.id" />
            </li>
          </ul>
        </template>
      </div>
      <p
        v-else
        class="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
      >
        {{ toHouseName }} ยังไม่มี "{{ item.name }}" — กดถัดไปเพื่อกรอกรายละเอียดของใหม่
      </p>

      <button
        type="button"
        :disabled="!canConfirm"
        class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        @click="confirm"
      >
        {{ matches.length ? 'ย้าย' : 'ถัดไป' }}
      </button>
    </div>
  </BaseModal>
</template>
