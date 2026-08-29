import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { GlobalSearchResultGroup, House, ItemWithRelations } from '@/types'

const isOpen = ref(false)
const query = ref('')
const isSearching = ref(false)
const results = ref<GlobalSearchResultGroup[]>([])

async function search(term: string) {
  query.value = term
  const trimmed = term.trim()
  if (!trimmed) {
    results.value = []
    return
  }

  isSearching.value = true

  // หา tag ที่ชื่อตรงกับคำค้นก่อน เพราะ PostgREST filter ข้าม join table โดยตรงไม่ได้
  const { data: matchingTags } = await supabase
    .from('tags')
    .select('id')
    .ilike('name', `%${trimmed}%`)
  const tagIds = (matchingTags ?? []).map((t) => t.id)

  let itemsQuery = supabase
    .from('items')
    .select('*, tag:tags(*), location:locations(*), house:houses(*)')

  itemsQuery = tagIds.length
    ? itemsQuery.or(`name.ilike.%${trimmed}%,tag_id.in.(${tagIds.join(',')})`)
    : itemsQuery.ilike('name', `%${trimmed}%`)

  const { data, error } = await itemsQuery

  if (!error && data) {
    const grouped = new Map<string, GlobalSearchResultGroup>()
    for (const row of data as unknown as (ItemWithRelations & { house: House })[]) {
      const houseId = row.house.id
      if (!grouped.has(houseId)) {
        grouped.set(houseId, { house: row.house, items: [] })
      }
      grouped.get(houseId)!.items.push(row)
    }
    results.value = Array.from(grouped.values())
  } else {
    results.value = []
  }
  isSearching.value = false
}

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  query.value = ''
  results.value = []
}

export function useGlobalSearch() {
  return { isOpen, query, isSearching, results, search, open, close }
}
