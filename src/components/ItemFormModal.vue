<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useTags } from '@/composables/useTags'
import { useLocations } from '@/composables/useLocations'
import { fetchAllItemsGroupedByHouse } from '@/composables/useItems'
import type { GlobalSearchResultGroup, ItemFormPayload, ItemWithRelations } from '@/types'

const props = defineProps<{
  item?: ItemWithRelations | null
  // บ้านที่เปิดอยู่ — ใช้แยกว่าของเดิมที่เลือกอยู่บ้านนี้ (บันทึกทับ) หรือบ้านอื่น (ยืมข้อมูลมาเพิ่มเป็นชิ้นใหม่)
  houseId?: string
}>()

const emit = defineEmits<{
  close: []
  // overwriteItemId = id ของเดิมในบ้านนี้ที่ต้องบันทึกทับ, null = เพิ่มเป็นของชิ้นใหม่
  submit: [payload: ItemFormPayload, overwriteItemId: string | null]
}>()

const { tags, fetchTags } = useTags()
const { locations, fetchLocations } = useLocations()

const isEditMode = Boolean(props.item)

const name = ref('')
const tagId = ref('')
const newTagName = ref('')
const quantity = ref(1)
const expiryDate = ref('')
const price = ref<number | null>(null)
const locationId = ref('')
const newLocationName = ref('')
const isSubmitting = ref(false)

// เติมทุกช่องจาก item ที่ให้มา (ทับค่าที่กรอกไว้ทั้งหมด), null = ล้างฟอร์ม
function fillForm(source: ItemWithRelations | null) {
  name.value = source?.name ?? ''
  tagId.value = source?.tag_id ?? ''
  newTagName.value = ''
  quantity.value = source?.quantity ?? 1
  expiryDate.value = source?.expiry_date ?? ''
  price.value = source?.price ?? null
  locationId.value = source?.location_id ?? ''
  newLocationName.value = ''
}
fillForm(props.item ?? null)

// ===== โหมดเพิ่ม: ของใหม่ หรือ ใช้ของเดิม =====
type AddMode = 'new' | 'existing'
const mode = ref<AddMode>('new')
const existingGroups = ref<GlobalSearchResultGroup[]>([])
const isLoadingExisting = ref(false)
const existingError = ref<string | null>(null)
const isPickerOpen = ref(false)
const pickerQuery = ref('')
const sourceItem = ref<ItemWithRelations | null>(null)

// บ้านที่เปิดอยู่ขึ้นก่อน ที่เหลือคงลำดับบ้านเดิม
const filteredGroups = computed(() => {
  const q = pickerQuery.value.trim().toLowerCase()
  const groups = q
    ? existingGroups.value
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.tag?.name ?? '').toLowerCase().includes(q),
          ),
        }))
        .filter((group) => group.items.length)
    : existingGroups.value
  return [...groups].sort(
    (a, b) => Number(b.house.id === props.houseId) - Number(a.house.id === props.houseId),
  )
})

// เลือกของเดิมจากบ้านนี้ = บันทึกทับ record เดิม, จากบ้านอื่น = แค่ยืมข้อมูลมาเพิ่มเป็นชิ้นใหม่
const overwriteItemId = computed(() =>
  mode.value === 'existing' && sourceItem.value?.house_id === props.houseId
    ? sourceItem.value.id
    : null,
)

const sourceHouseName = computed(
  () => existingGroups.value.find((g) => g.house.id === sourceItem.value?.house_id)?.house.name ?? '',
)

const canSubmit = computed(
  () => Boolean(name.value.trim()) && !isSubmitting.value && !(mode.value === 'existing' && !sourceItem.value),
)

async function loadExistingItems() {
  isLoadingExisting.value = true
  existingError.value = null
  try {
    existingGroups.value = await fetchAllItemsGroupedByHouse()
  } catch (err) {
    existingError.value = (err as Error).message
  } finally {
    isLoadingExisting.value = false
  }
}

function setMode(next: AddMode) {
  if (mode.value === next) return
  mode.value = next
  if (next === 'existing') {
    isPickerOpen.value = true
    if (!existingGroups.value.length && !isLoadingExisting.value) loadExistingItems()
  } else if (sourceItem.value) {
    // ค่าในฟอร์มยืมมาจากของเดิม — กลับมาเพิ่มของใหม่ให้เริ่มจากฟอร์มว่าง
    sourceItem.value = null
    fillForm(null)
  }
}

function pickItem(source: ItemWithRelations) {
  sourceItem.value = source
  fillForm(source)
  isPickerOpen.value = false
  pickerQuery.value = ''
}

// text-base บนมือถือกัน iOS ซูมตอนแตะ input (iOS ซูมเมื่อฟอนต์ < 16px), min-w-0 กัน input ดันจนล้นคอลัมน์
const fieldClass =
  'block w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-base sm:text-sm'
const labelClass = 'mb-1 block text-xs font-medium text-[var(--color-text-muted)]'
onMounted(() => {
  fetchTags()
  fetchLocations()
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function submit() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  try {
    const payload: ItemFormPayload = {
      name: name.value.trim(),
      tag_id: tagId.value || null,
      new_tag_name: newTagName.value.trim() || null,
      // ใช้ ?? แทน || เพื่อให้บันทึกจำนวน 0 ได้ (ของหมดแล้วแต่ยังอยากเก็บรายการไว้)
      quantity: Number(quantity.value ?? 1),
      expiry_date: expiryDate.value || null,
      price: price.value === null || price.value === undefined ? null : Number(price.value),
      location_id: locationId.value || null,
      new_location_name: newLocationName.value.trim() || null,
    }
    emit('submit', payload, overwriteItemId.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal :title="isEditMode ? 'แก้ไขสิ่งของ' : 'เพิ่มสิ่งของ'" max-width="max-w-lg" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <!-- เลือกโหมดเฉพาะตอนเพิ่ม: พิมพ์ของใหม่เอง หรือดึงข้อมูลจากของที่มีอยู่แล้ว -->
      <div
        v-if="!isEditMode"
        class="grid grid-cols-2 gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-1"
        role="group"
        aria-label="วิธีเพิ่มสิ่งของ"
      >
        <button
          v-for="option in [
            { value: 'new' as const, label: 'เพิ่มของใหม่' },
            { value: 'existing' as const, label: 'ใช้ของเดิม' },
          ]"
          :key="option.value"
          type="button"
          class="rounded-[var(--radius-control)] py-1.5 text-sm transition"
          :class="
            mode === option.value
              ? 'bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary-dark)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          "
          :aria-pressed="mode === option.value"
          @click="setMode(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="mode === 'existing'">
        <label :class="labelClass">สิ่งของที่มีอยู่แล้ว</label>
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-left text-sm"
          :aria-expanded="isPickerOpen"
          @click="isPickerOpen = !isPickerOpen"
        >
          <template v-if="sourceItem">
            <span
              class="min-w-0 truncate rounded-full bg-[var(--color-primary-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary-dark)]"
            >
              {{ sourceItem.name }}
            </span>
            <span class="shrink-0 text-xs text-[var(--color-text-muted)]">{{ sourceHouseName }}</span>
          </template>
          <span v-else class="text-[var(--color-text-muted)]">กดเพื่อเลือกสิ่งของ...</span>
          <span class="ml-auto shrink-0 text-xs text-[var(--color-text-muted)]">{{ isPickerOpen ? '▲' : '▼' }}</span>
        </button>

        <div
          v-if="isPickerOpen"
          class="mt-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2"
        >
          <input
            v-model="pickerQuery"
            type="text"
            placeholder="ค้นหาชื่อสิ่งของ หรือ tag..."
            :class="fieldClass"
            @keydown.enter.prevent
          />
          <div class="mt-2 max-h-60 space-y-3 overflow-y-auto">
            <p v-if="isLoadingExisting" class="px-1 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</p>
            <p v-else-if="existingError" class="px-1 text-sm text-[var(--color-danger)]">
              โหลดรายการไม่สำเร็จ: {{ existingError }}
            </p>
            <p v-else-if="!filteredGroups.length" class="px-1 text-sm text-[var(--color-text-muted)]">
              {{ pickerQuery.trim() ? `ไม่พบสิ่งของที่ตรงกับ "${pickerQuery}"` : 'ยังไม่มีสิ่งของในบ้านไหนเลย' }}
            </p>

            <div v-for="group in filteredGroups" :key="group.house.id">
              <p class="mb-1 px-1 text-xs font-semibold tracking-wide text-[var(--color-text-muted)]">
                {{ group.house.name }}
                <span v-if="group.house.id === houseId" class="font-normal">(บ้านนี้)</span>
              </p>
              <ul class="space-y-1">
                <li v-for="existing in group.items" :key="existing.id">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border px-3 py-2 text-left text-sm transition"
                    :class="
                      sourceItem?.id === existing.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                        : 'border-transparent bg-[var(--color-surface-muted)] hover:border-[var(--color-primary)]'
                    "
                    @click="pickItem(existing)"
                  >
                    <span class="min-w-0 truncate font-medium text-[var(--color-text)]">{{ existing.name }}</span>
                    <span class="flex shrink-0 items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span
                        v-if="existing.tag"
                        class="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[var(--color-primary-dark)]"
                      >
                        {{ existing.tag.name }}
                      </span>
                      <span>×{{ existing.quantity }}</span>
                      <span v-if="existing.expiry_date">{{ formatDate(existing.expiry_date) }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- บอกให้ชัดว่ากดบันทึกแล้วจะเกิดอะไร -->
        <p
          v-if="sourceItem && overwriteItemId"
          class="mt-2 rounded-[var(--radius-control)] bg-[var(--color-warning-light)] px-3 py-2 text-xs text-[var(--color-warning)]"
        >
          บันทึกแล้วจะทับข้อมูลเดิมของ "{{ sourceItem.name }}" ในบ้านนี้ทั้งหมด
        </p>
        <p
          v-else-if="sourceItem"
          class="mt-2 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
        >
          ยืมข้อมูลจากบ้าน "{{ sourceHouseName }}" มาเพิ่มเป็นของชิ้นใหม่ในบ้านนี้ — ของที่บ้านนั้นไม่ถูกแก้ไข
        </p>
      </div>

      <!-- โหมดใช้ของเดิม: ซ่อนช่องกรอกไว้จนกว่าจะเลือกสิ่งของ -->
      <template v-if="mode === 'new' || sourceItem">
        <div>
          <label :class="labelClass">ชื่อสิ่งของ *</label>
          <input v-model="name" type="text" required autofocus :class="fieldClass" />
        </div>

        <!-- มือถือเรียงลงมาทีละช่อง, จอใหญ่ขึ้นเลือก/พิมพ์ใหม่วางข้างกัน -->
        <div>
          <label :class="labelClass">ประเภท (tag)</label>
          <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3">
            <select v-model="tagId" :class="fieldClass">
              <option value="">เลือก tag ที่มีอยู่...</option>
              <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
            </select>
            <input v-model="newTagName" type="text" placeholder="หรือพิมพ์ tag ใหม่" :class="fieldClass" />
          </div>
        </div>

        <!-- จำนวน + ราคาเป็นช่องตัวเลขแคบๆ วางคู่กันได้แม้บนมือถือ, วันหมดอายุเต็มแถวบนมือถือ -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="min-w-0">
            <label :class="labelClass">จำนวน *</label>
            <input v-model.number="quantity" type="number" min="0" required inputmode="decimal" :class="fieldClass" />
          </div>
          <div class="min-w-0">
            <label :class="labelClass">ราคา</label>
            <input
              v-model.number="price"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              :class="fieldClass"
            />
          </div>
          <div class="col-span-2 min-w-0 sm:col-span-1">
            <label :class="labelClass">วันหมดอายุ</label>
            <!-- min-h กัน iOS ยุบ input date ตอนยังไม่มีค่า -->
            <input v-model="expiryDate" type="date" :class="[fieldClass, 'min-h-[2.625rem] appearance-none']" />
          </div>
        </div>

        <div>
          <label :class="labelClass">สถานที่ที่ซื้อ</label>
          <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3">
            <select v-model="locationId" :class="fieldClass">
              <option value="">เลือกสถานที่ที่เคยเพิ่ม...</option>
              <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
            </select>
            <input v-model="newLocationName" type="text" placeholder="หรือพิมพ์สถานที่ใหม่" :class="fieldClass" />
          </div>
        </div>
      </template>

      <button
        type="submit"
        :disabled="!canSubmit"
        class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {{ isEditMode ? 'บันทึกการแก้ไข' : overwriteItemId ? 'บันทึกทับรายการเดิม' : 'เพิ่มสิ่งของ' }}
      </button>
    </form>
  </BaseModal>
</template>
