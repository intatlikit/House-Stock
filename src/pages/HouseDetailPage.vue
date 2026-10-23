<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FabButton from '@/components/FabButton.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
import ItemTable from '@/components/ItemTable.vue'
import ItemFormModal from '@/components/ItemFormModal.vue'
import ItemDetailModal from '@/components/ItemDetailModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useHouses } from '@/composables/useHouses'
import { useItemsForHouse } from '@/composables/useItems'
import { useTags } from '@/composables/useTags'
import type { ItemFormPayload, ItemWithRelations } from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const { houses, fetchHouses } = useHouses()
const { tags, fetchTags } = useTags()

const house = computed(() => houses.value.find((h) => h.id === props.id))

const {
  items,
  searchQuery,
  activeSort,
  setSort,
  clearSearch,
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  updateQuantity,
} = useItemsForHouse(props.id)

onMounted(async () => {
  if (!houses.value.length) await fetchHouses()
  await Promise.all([fetchItems(), fetchTags()])
})

// tag ถือว่า "ถูกเลือก" เมื่อคำค้นตรงกับชื่อ tag (ไม่สนตัวพิมพ์เล็ก/ใหญ่) — ครอบคลุมทั้งกดเลือกและพิมพ์เอง
function isTagActive(tagName: string) {
  return searchQuery.value.trim().toLowerCase() === tagName.toLowerCase()
}

// กด tag ครั้งแรก = filter ด้วย tag นั้น, กดซ้ำ = ยกเลิกและล้างคำค้น
function toggleTag(tagName: string) {
  if (isTagActive(tagName)) clearSearch()
  else searchQuery.value = tagName
}

// popup states
const showAddModal = ref(false)
const editingItem = ref<ItemWithRelations | null>(null)
const viewingItem = ref<ItemWithRelations | null>(null)
const deletingItem = ref<ItemWithRelations | null>(null)

// overwriteItemId มีค่าเมื่อเลือก "ใช้ของเดิม" จากบ้านนี้ -> บันทึกทับ record เดิมแทนการเพิ่มใหม่
// (payload.quantity ถูกบวกจำนวนเดิมมาให้แล้วจากฟอร์ม)
async function handleAddSubmit(payload: ItemFormPayload, overwriteItemId: string | null) {
  if (overwriteItemId) await updateItem(overwriteItemId, payload)
  else await addItem(payload)
  showAddModal.value = false
}

async function handleEditSubmit(payload: ItemFormPayload) {
  if (!editingItem.value) return
  await updateItem(editingItem.value.id, payload)
  editingItem.value = null
}

async function confirmDelete() {
  if (!deletingItem.value) return
  await deleteItem(deletingItem.value.id)
  deletingItem.value = null
}
</script>

<template>
  <div class="min-h-full">
    <AppHeader>
      <template #left>
        <button
          type="button"
          class="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="router.push({ name: 'landing' })"
        >
          ← <span class="font-semibold text-[var(--color-text)]">{{ house?.name ?? 'บ้าน' }}</span>
        </button>
      </template>
    </AppHeader>

    <!-- pb-24 กันไม่ให้ปุ่มลอยบังแถวล่างสุดของตาราง -->
    <main class="mx-auto max-w-5xl space-y-4 px-4 pt-6 pb-24 sm:px-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาสิ่งของด้วยชื่อ หรือ tag..."
            class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 pr-9 text-sm"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-label="ล้างคำค้นหา"
            @click="clearSearch"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- tag แนะนำ กดเพื่อ filter ด้วย tag นั้น กดซ้ำเพื่อยกเลิก -->
      <div v-if="tags.length" class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.id"
          type="button"
          class="rounded-full border px-2.5 py-1 text-xs transition"
          :class="
            isTagActive(tag.name)
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary-dark)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
          "
          :aria-pressed="isTagActive(tag.name)"
          @click="toggleTag(tag.name)"
        >
          {{ tag.name }}
        </button>
      </div>

      <ItemTable
        :items="items"
        :sort="activeSort"
        @sort="setSort"
        @view="(item) => (viewingItem = item)"
        @edit="(item) => (editingItem = item)"
        @delete="(item) => (deletingItem = item)"
        @update-quantity="(item, qty) => updateQuantity(item.id, qty)"
      />
    </main>

    <ScrollTopButton />
    <FabButton label="เพิ่มสิ่งของ" @click="showAddModal = true" />

    <ItemFormModal
      v-if="showAddModal"
      :house-id="id"
      @close="showAddModal = false"
      @submit="handleAddSubmit"
    />

    <ItemFormModal
      v-if="editingItem"
      :item="editingItem"
      @close="editingItem = null"
      @submit="handleEditSubmit"
    />

    <ItemDetailModal v-if="viewingItem" :item="viewingItem" @close="viewingItem = null" />

    <ConfirmDialog
      v-if="deletingItem"
      :title="`ลบ '${deletingItem.name}' ?`"
      message="รายการนี้จะถูกลบออกจากสต็อกทันที และไม่สามารถกู้คืนได้"
      confirm-label="ลบสิ่งของนี้"
      @confirm="confirmDelete"
      @cancel="deletingItem = null"
    />
  </div>
</template>
