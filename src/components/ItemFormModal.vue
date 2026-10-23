<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useTags } from '@/composables/useTags'
import { useLocations } from '@/composables/useLocations'
import { useHouses } from '@/composables/useHouses'
import { fetchAllItemsGroupedByHouse } from '@/composables/useItems'
import type { GlobalSearchResultGroup, ItemFormPayload, ItemWithRelations } from '@/types'

const props = defineProps<{
  item?: ItemWithRelations | null
  // บ้านที่เปิดอยู่ — ใช้แยกว่าของเดิมที่เลือกอยู่บ้านนี้ (บันทึกทับ) หรือบ้านอื่น (ยืมข้อมูลมาเพิ่มเป็นชิ้นใหม่)
  houseId?: string
}>()

const emit = defineEmits<{
  close: []
  delete: []
  // overwriteItemId = id ของเดิมในบ้านนี้ที่ต้องบันทึกทับ, null = เพิ่มเป็นของชิ้นใหม่
  submit: [payload: ItemFormPayload, overwriteItemId: string | null]
}>()

const { tags, fetchTags } = useTags()
const { locations, fetchLocations } = useLocations()
const { houses } = useHouses()

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
// บ้านที่กำลังดูรายการของเดิมอยู่ เริ่มที่บ้านที่เปิดอยู่
const pickerHouseId = ref(props.houseId ?? '')
const pickerQuery = ref('')
const sourceItem = ref<ItemWithRelations | null>(null)

// บ้านที่เปิดอยู่ขึ้นก่อน ที่เหลือคงลำดับบ้านเดิม
const pickerHouses = computed(() =>
  [...houses.value].sort((a, b) => Number(b.id === props.houseId) - Number(a.id === props.houseId)),
)

// สิ่งของของบ้านที่เลือก กรองด้วยชื่อหรือ tag
const pickerItems = computed(() => {
  const items = existingGroups.value.find((g) => g.house.id === pickerHouseId.value)?.items ?? []
  const q = pickerQuery.value.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (item) => item.name.toLowerCase().includes(q) || (item.tag?.name ?? '').toLowerCase().includes(q),
  )
})

// เลือกของเดิมจากบ้านนี้ = บันทึกทับ record เดิม, จากบ้านอื่น = แค่ยืมข้อมูลมาเพิ่มเป็นชิ้นใหม่
const overwriteItemId = computed(() => {
  const source = sourceItem.value
  return mode.value === 'existing' && source && source.house_id === props.houseId ? source.id : null
})

// ของเดิมในบ้านนี้: ช่องจำนวนคือจำนวนที่ซื้อเพิ่ม แล้วบวกเข้ากับจำนวนเดิมตอนบันทึก
const baseQuantity = computed(() => (overwriteItemId.value ? (sourceItem.value?.quantity ?? 0) : 0))

const sourceHouseName = computed(
  () => houses.value.find((h) => h.id === sourceItem.value?.house_id)?.name ?? '',
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
  // ของบ้านนี้จะบวกจำนวนเพิ่ม — เริ่มที่ซื้อเพิ่ม 1 ชิ้นแทนการยกจำนวนเดิมมาทั้งหมด
  if (source.house_id === props.houseId) quantity.value = 1
}

// เปลี่ยนบ้าน = เริ่มเลือกใหม่หมด: ล้างสิ่งของที่เลือกไว้และค่าในฟอร์มที่ยืมมา
function selectPickerHouse(houseId: string) {
  if (pickerHouseId.value === houseId) return
  pickerHouseId.value = houseId
  pickerQuery.value = ''
  sourceItem.value = null
  fillForm(null)
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
      quantity: baseQuantity.value + Number(quantity.value ?? 1),
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
        <label :class="labelClass">เลือกบ้าน</label>
        <!-- ปุ่มเลือกบ้าน แล้วแสดงช่องค้นหา + สิ่งของของบ้านนั้นข้างล่าง -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="h in pickerHouses"
            :key="h.id"
            type="button"
            class="rounded-full border px-3 py-1 text-xs transition"
            :class="
              pickerHouseId === h.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary-dark)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            "
            :aria-pressed="pickerHouseId === h.id"
            @click="selectPickerHouse(h.id)"
          >
            {{ h.name }}<span v-if="h.id === houseId"> (บ้านนี้)</span>
          </button>
        </div>

        <div class="mt-2 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2">
          <input
            v-model="pickerQuery"
            type="text"
            placeholder="ค้นหาชื่อสิ่งของ หรือ tag..."
            :class="fieldClass"
            @keydown.enter.prevent
          />
          <div class="mt-2 max-h-60 overflow-y-auto">
            <p v-if="isLoadingExisting" class="px-1 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</p>
            <p v-else-if="existingError" class="px-1 text-sm text-[var(--color-danger)]">
              โหลดรายการไม่สำเร็จ: {{ existingError }}
            </p>
            <p v-else-if="!pickerItems.length" class="px-1 text-sm text-[var(--color-text-muted)]">
              {{ pickerQuery.trim() ? `ไม่พบสิ่งของที่ตรงกับ "${pickerQuery}"` : 'ยังไม่มีสิ่งของในบ้านนี้' }}
            </p>

            <ul v-else class="space-y-1">
              <li v-for="existing in pickerItems" :key="existing.id">
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

        <!-- บอกให้ชัดว่ากดบันทึกแล้วจะเกิดอะไร -->
        <p
          v-if="sourceItem && overwriteItemId"
          class="mt-2 rounded-[var(--radius-control)] bg-[var(--color-warning-light)] px-3 py-2 text-xs text-[var(--color-warning)]"
        >
          บันทึกแล้วจะบวกจำนวนที่กรอกเข้ากับ "{{ sourceItem.name }}" ในบ้านนี้ และทับข้อมูลช่องอื่นด้วยค่าในฟอร์ม
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
            <label :class="labelClass">{{ overwriteItemId ? 'จำนวนที่เพิ่ม *' : 'จำนวน *' }}</label>
            <input v-model.number="quantity" type="number" min="0" required inputmode="decimal" :class="fieldClass" />
            <p v-if="overwriteItemId" class="mt-1 text-xs text-[var(--color-text-muted)]">
              เดิม {{ baseQuantity }} → รวม {{ baseQuantity + Number(quantity ?? 0) }}
            </p>
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

      <div class="space-y-2">
        <button
          v-if="isEditMode"
          type="button"
          class="w-full rounded-[var(--radius-control)] border border-[var(--color-danger)] bg-transparent py-2.5 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger-light)]"
          @click="emit('delete')"
        >
          ลบสิ่งของชิ้นนี้
        </button>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {{ isEditMode ? 'บันทึกการแก้ไข' : overwriteItemId ? 'เพิ่มเข้ารายการเดิม' : 'เพิ่มสิ่งของ' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
