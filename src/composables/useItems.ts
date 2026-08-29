import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { ItemFormPayload, ItemWithRelations, SortState } from '@/types'
import { useTags } from '@/composables/useTags'
import { useLocations } from '@/composables/useLocations'

// เก็บ item ของทุกบ้านไว้ใน map เดียว (global) key = house_id -> รายการของบ้านนั้น
const itemsByHouse = ref<Record<string, ItemWithRelations[]>>({})
const isLoading = ref(false)
const error = ref<string | null>(null)

const SELECT_WITH_RELATIONS = '*, tag:tags(*), location:locations(*)'

async function fetchItemsForHouse(houseId: string) {
  isLoading.value = true
  error.value = null
  const { data, error: err } = await supabase
    .from('items')
    .select(SELECT_WITH_RELATIONS)
    .eq('house_id', houseId)

  if (err) {
    error.value = err.message
  } else {
    itemsByHouse.value[houseId] = (data ?? []) as unknown as ItemWithRelations[]
  }
  isLoading.value = false
}

/** ค่าเริ่มต้น: เรียงตามวันหมดอายุใกล้สุดก่อน, ถ้าไม่มีวันหมดอายุให้ต่อท้ายด้วยวันที่เพิ่มเข้ามาเก่าสุดก่อน */
function defaultSortItems(items: ItemWithRelations[]): ItemWithRelations[] {
  return [...items].sort((a, b) => {
    if (a.expiry_date && b.expiry_date) {
      return a.expiry_date.localeCompare(b.expiry_date)
    }
    if (a.expiry_date && !b.expiry_date) return -1
    if (!a.expiry_date && b.expiry_date) return 1
    return a.created_at.localeCompare(b.created_at)
  })
}

function sortItems(items: ItemWithRelations[], sort: SortState | null): ItemWithRelations[] {
  if (!sort) return defaultSortItems(items)

  const dir = sort.direction === 'asc' ? 1 : -1
  const sorted = [...items].sort((a, b) => {
    switch (sort.column) {
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'tag':
        return (a.tag?.name ?? '').localeCompare(b.tag?.name ?? '') * dir
      case 'quantity':
        return (a.quantity - b.quantity) * dir
      case 'expiry_date': {
        if (!a.expiry_date && !b.expiry_date) return 0
        if (!a.expiry_date) return 1 * dir
        if (!b.expiry_date) return -1 * dir
        return a.expiry_date.localeCompare(b.expiry_date) * dir
      }
      default:
        return 0
    }
  })
  return sorted
}

function useItemsForHouse(houseId: string) {
  const { getOrCreateTag } = useTags()
  const { getOrCreateLocation } = useLocations()

  const rawItems = computed(() => itemsByHouse.value[houseId] ?? [])

  const searchQuery = ref('')
  const activeSort = ref<SortState | null>(null)

  const filteredItems = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const base = q
      ? rawItems.value.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.tag?.name ?? '').toLowerCase().includes(q),
        )
      : rawItems.value
    return sortItems(base, activeSort.value)
  })

  function setSort(column: SortState['column']) {
    if (activeSort.value?.column === column) {
      activeSort.value = {
        column,
        direction: activeSort.value.direction === 'asc' ? 'desc' : 'asc',
      }
    } else {
      activeSort.value = { column, direction: 'asc' }
    }
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  async function addItem(payload: ItemFormPayload) {
    let tagId = payload.tag_id
    if (!tagId && payload.new_tag_name) {
      tagId = (await getOrCreateTag(payload.new_tag_name)).id
    }
    let locationId = payload.location_id
    if (!locationId && payload.new_location_name) {
      locationId = (await getOrCreateLocation(payload.new_location_name)).id
    }

    const { data, error: err } = await supabase
      .from('items')
      .insert({
        house_id: houseId,
        name: payload.name,
        tag_id: tagId,
        quantity: payload.quantity,
        expiry_date: payload.expiry_date,
        price: payload.price,
        location_id: locationId,
      })
      .select(SELECT_WITH_RELATIONS)
      .single()

    if (err) throw err
    itemsByHouse.value[houseId] = [...rawItems.value, data as unknown as ItemWithRelations]
    return data
  }

  async function updateItem(itemId: string, payload: ItemFormPayload) {
    let tagId = payload.tag_id
    if (!tagId && payload.new_tag_name) {
      tagId = (await getOrCreateTag(payload.new_tag_name)).id
    }
    let locationId = payload.location_id
    if (!locationId && payload.new_location_name) {
      locationId = (await getOrCreateLocation(payload.new_location_name)).id
    }

    const { data, error: err } = await supabase
      .from('items')
      .update({
        name: payload.name,
        tag_id: tagId,
        quantity: payload.quantity,
        expiry_date: payload.expiry_date,
        price: payload.price,
        location_id: locationId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select(SELECT_WITH_RELATIONS)
      .single()

    if (err) throw err
    itemsByHouse.value[houseId] = rawItems.value.map((item) =>
      item.id === itemId ? (data as unknown as ItemWithRelations) : item,
    )
    return data
  }

  async function deleteItem(itemId: string) {
    const { error: err } = await supabase.from('items').delete().eq('id', itemId)
    if (err) throw err
    itemsByHouse.value[houseId] = rawItems.value.filter((item) => item.id !== itemId)
  }

  return {
    items: filteredItems,
    isLoading,
    error,
    searchQuery,
    activeSort,
    setSort,
    clearSearch,
    fetchItems: () => fetchItemsForHouse(houseId),
    addItem,
    updateItem,
    deleteItem,
  }
}

export { useItemsForHouse, fetchItemsForHouse }
