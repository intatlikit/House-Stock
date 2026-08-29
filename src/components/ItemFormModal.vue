<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useTags } from '@/composables/useTags'
import { useLocations } from '@/composables/useLocations'
import type { ItemFormPayload, ItemWithRelations } from '@/types'

const props = defineProps<{
  item?: ItemWithRelations | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ItemFormPayload]
}>()

const { tags, fetchTags } = useTags()
const { locations, fetchLocations } = useLocations()

const isEditMode = Boolean(props.item)

const name = ref(props.item?.name ?? '')
const tagId = ref(props.item?.tag_id ?? '')
const newTagName = ref('')
const quantity = ref(props.item?.quantity ?? 1)
const expiryDate = ref(props.item?.expiry_date ?? '')
const price = ref(props.item?.price ?? null)
const locationId = ref(props.item?.location_id ?? '')
const newLocationName = ref('')
const isSubmitting = ref(false)

onMounted(() => {
  fetchTags()
  fetchLocations()
})

async function submit() {
  if (!name.value.trim() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const payload: ItemFormPayload = {
      name: name.value.trim(),
      tag_id: tagId.value || null,
      new_tag_name: newTagName.value.trim() || null,
      quantity: Number(quantity.value) || 1,
      expiry_date: expiryDate.value || null,
      price: price.value === null || price.value === undefined ? null : Number(price.value),
      location_id: locationId.value || null,
      new_location_name: newLocationName.value.trim() || null,
    }
    emit('submit', payload)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal :title="isEditMode ? 'แก้ไขสิ่งของ' : 'เพิ่มสิ่งของ'" max-width="max-w-lg" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">ชื่อสิ่งของ *</label>
        <input
          v-model="name"
          type="text"
          required
          autofocus
          class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">ประเภท (tag)</label>
          <select
            v-model="tagId"
            class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <option value="">เลือก tag ที่มีอยู่...</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
          </select>
          <input
            v-model="newTagName"
            type="text"
            placeholder="หรือพิมพ์ tag ใหม่"
            class="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">จำนวน *</label>
          <input
            v-model.number="quantity"
            type="number"
            min="0"
            required
            class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">วันหมดอายุ</label>
          <input
            v-model="expiryDate"
            type="date"
            class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">ราคา</label>
          <input
            v-model.number="price"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">สถานที่ที่ซื้อ</label>
        <select
          v-model="locationId"
          class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        >
          <option value="">เลือกสถานที่ที่เคยเพิ่ม...</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>
        <input
          v-model="newLocationName"
          type="text"
          placeholder="หรือพิมพ์สถานที่ใหม่"
          class="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        :disabled="!name.trim() || isSubmitting"
        class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {{ isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มสิ่งของ' }}
      </button>
    </form>
  </BaseModal>
</template>
