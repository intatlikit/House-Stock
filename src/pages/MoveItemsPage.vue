<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BackButton from '@/components/BackButton.vue'
import HousePicker from '@/components/HousePicker.vue'
import SearchField from '@/components/SearchField.vue'
import ChipButton from '@/components/ChipButton.vue'
import ItemListRow from '@/components/ItemListRow.vue'
import StatusBanner from '@/components/StatusBanner.vue'
import MoveItemModal from '@/components/MoveItemModal.vue'
import ItemFormModal from '@/components/ItemFormModal.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
import { useHouses } from '@/composables/useHouses'
import { compareTagNames } from '@/composables/useTags'
import {
  defaultSortItems,
  fetchItemsForHouse,
  getItemsOfHouse,
  moveItemAsNew,
  moveItemToExisting,
} from '@/composables/useItems'
import type { ItemFormPayload, ItemWithRelations, Tag } from '@/types'

const router = useRouter()
const { houses, fetchHouses } = useHouses()

const fromHouseId = ref('')
const toHouseId = ref('')
const isSourceLoading = ref(false)
const isDestLoading = ref(false)

const searchQuery = ref('')
const activeTagId = ref<string | null>(null)

const status = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

const fromHouse = computed(() => houses.value.find((h) => h.id === fromHouseId.value))
const toHouse = computed(() => houses.value.find((h) => h.id === toHouseId.value))
// บ้านปลายทางเลือกได้ทุกหลังยกเว้นบ้านต้นทาง
const destinationHouses = computed(() => houses.value.filter((h) => h.id !== fromHouseId.value))

const sourceItems = computed(() => defaultSortItems(getItemsOfHouse(fromHouseId.value)))

// tag ให้ filter เฉพาะที่มีใช้อยู่ในบ้านต้นทาง เรียงอังกฤษก่อนไทย
const sourceTags = computed(() => {
  const unique = new Map<string, Tag>()
  for (const item of sourceItems.value) if (item.tag) unique.set(item.tag.id, item.tag)
  return [...unique.values()].sort((a, b) => compareTagNames(a.name, b.name))
})

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return sourceItems.value.filter(
    (item) =>
      (!activeTagId.value || item.tag_id === activeTagId.value) &&
      (!q || item.name.toLowerCase().includes(q) || (item.tag?.name ?? '').toLowerCase().includes(q)),
  )
})

// ยังไม่เลือกปลายทาง หรือกำลังโหลดของปลายทาง (ต้องรู้ว่ามีชื่อซ้ำไหม) = ยังกดย้ายไม่ได้
const canMove = computed(() => Boolean(toHouseId.value) && !isDestLoading.value)

// เลือกบ้านต้นทางแล้ว ตั้งบ้านปลายทางเป็นหลังแรกที่เหลือให้เสมอ (เปลี่ยนเองทีหลังได้)
async function selectFromHouse(houseId: string) {
  if (fromHouseId.value === houseId) return
  fromHouseId.value = houseId
  searchQuery.value = ''
  activeTagId.value = null
  toHouseId.value = ''
  isSourceLoading.value = true
  const firstDestination = destinationHouses.value[0]
  await Promise.all([
    fetchItemsForHouse(houseId),
    firstDestination ? selectToHouse(firstDestination.id) : Promise.resolve(),
  ])
  isSourceLoading.value = false
}

async function selectToHouse(houseId: string) {
  if (toHouseId.value === houseId) return
  toHouseId.value = houseId
  isDestLoading.value = true
  await fetchItemsForHouse(houseId)
  isDestLoading.value = false
}

// กด tag ครั้งแรก = filter, กดซ้ำ = ยกเลิก
function toggleTag(tagId: string) {
  activeTagId.value = activeTagId.value === tagId ? null : tagId
}

// ===== ขั้นตอนย้าย: เลือกจำนวน (MoveItemModal) → ถ้าปลายทางไม่มีชื่อนี้ ไปกรอกของใหม่ (ItemFormModal) =====
const movingItem = ref<ItemWithRelations | null>(null)
const newItemDraft = ref<{ source: ItemWithRelations; quantity: number } | null>(null)

// ของชื่อเดียวกันที่บ้านปลายทาง (ไม่สนตัวพิมพ์เล็ก/ใหญ่ และช่องว่างหัวท้าย)
const destinationMatches = computed(() => {
  const name = movingItem.value?.name.trim().toLowerCase()
  if (!name) return []
  return defaultSortItems(getItemsOfHouse(toHouseId.value)).filter((i) => i.name.trim().toLowerCase() === name)
})

// ข้อมูลตั้งต้นของฟอร์มของใหม่ = ข้อมูลของต้นทาง แต่จำนวนเป็นจำนวนที่ย้าย
const newItemPrefill = computed(() =>
  newItemDraft.value ? { ...newItemDraft.value.source, quantity: newItemDraft.value.quantity } : null,
)

function openMove(item: ItemWithRelations) {
  if (!canMove.value) return
  status.value = null
  movingItem.value = item
}

function moveSucceeded(name: string, quantity: number) {
  status.value = { tone: 'success', message: `ย้าย "${name}" จำนวน ${quantity} ไป ${toHouse.value?.name ?? ''} แล้ว` }
}

function moveFailed(err: unknown) {
  status.value = { tone: 'error', message: `ย้ายไม่สำเร็จ: ${(err as Error).message}` }
}

async function handleMoveConfirm(quantity: number, targetId: string | null) {
  const source = movingItem.value
  if (!source) return
  const target = destinationMatches.value.find((m) => m.id === targetId)

  if (!target) {
    movingItem.value = null
    newItemDraft.value = { source, quantity }
    return
  }

  try {
    await moveItemToExisting(source, target, quantity)
    moveSucceeded(source.name, quantity)
  } catch (err) {
    moveFailed(err)
  } finally {
    movingItem.value = null
  }
}

async function handleNewItemSubmit(payload: ItemFormPayload) {
  const draft = newItemDraft.value
  if (!draft) return
  try {
    // ช่องจำนวนในฟอร์มถูกล็อก — ใช้จำนวนที่เลือกไว้เสมอ
    await moveItemAsNew(draft.source, toHouseId.value, { ...payload, quantity: draft.quantity })
    moveSucceeded(draft.source.name, draft.quantity)
  } catch (err) {
    moveFailed(err)
  } finally {
    newItemDraft.value = null
  }
}

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'landing' })
}

onMounted(() => {
  if (!houses.value.length) fetchHouses()
})
</script>

<template>
  <div class="min-h-full">
    <AppHeader>
      <template #left>
        <BackButton label="ย้ายของ" @click="goBack" />
      </template>
    </AppHeader>

    <main class="mx-auto max-w-2xl space-y-5 px-4 pt-6 pb-24 sm:px-6">
      <p v-if="houses.length < 2" class="text-sm text-[var(--color-text-muted)]">
        ต้องมีบ้านอย่างน้อย 2 หลังถึงจะย้ายของได้
      </p>

      <template v-else>
        <section
          class="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <HousePicker label="ย้ายจากบ้าน" :houses="houses" :selected-id="fromHouseId" @select="selectFromHouse" />
          <HousePicker
            v-if="fromHouseId"
            label="ไปบ้าน"
            :houses="destinationHouses"
            :selected-id="toHouseId"
            @select="selectToHouse"
          />
        </section>

        <StatusBanner v-if="status" :tone="status.tone" :message="status.message" @close="status = null" />

        <section v-if="fromHouse" class="space-y-3">
          <SearchField v-model="searchQuery" :placeholder="`ค้นหาสิ่งของใน ${fromHouse.name}...`" />

          <div v-if="sourceTags.length" class="flex flex-wrap gap-2">
            <ChipButton
              v-for="tag in sourceTags"
              :key="tag.id"
              :active="activeTagId === tag.id"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </ChipButton>
          </div>

          <p v-if="!toHouseId" class="text-xs text-[var(--color-warning)]">เลือกบ้านปลายทางก่อน แล้วกดที่สิ่งของเพื่อย้าย</p>

          <p v-if="isSourceLoading" class="text-sm text-[var(--color-text-muted)]">กำลังโหลด...</p>
          <p v-else-if="!sourceItems.length" class="text-sm text-[var(--color-text-muted)]">ยังไม่มีสิ่งของในบ้านนี้</p>
          <p v-else-if="!filteredItems.length" class="text-sm text-[var(--color-text-muted)]">ไม่พบสิ่งของที่ค้นหา</p>
          <!-- ของที่จำนวนเป็น 0 ย้ายไม่ได้ -->
          <ul v-else class="space-y-1.5">
            <li v-for="item in filteredItems" :key="item.id">
              <ItemListRow :item="item" :disabled="!canMove || item.quantity <= 0" @click="openMove(item)" />
            </li>
          </ul>
        </section>
      </template>
    </main>

    <ScrollTopButton />

    <MoveItemModal
      v-if="movingItem && fromHouse && toHouse"
      :item="movingItem"
      :from-house-name="fromHouse.name"
      :to-house-name="toHouse.name"
      :matches="destinationMatches"
      @close="movingItem = null"
      @confirm="handleMoveConfirm"
    />

    <ItemFormModal
      v-if="newItemDraft && toHouse"
      :prefill="newItemPrefill"
      lock-quantity
      :title="`เพิ่มของใหม่ที่ ${toHouse.name}`"
      submit-label="ย้ายไปเป็นของใหม่"
      @close="newItemDraft = null"
      @submit="handleNewItemSubmit"
    />
  </div>
</template>
