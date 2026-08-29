import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { House } from '@/types'

// state ถูกประกาศนอกฟังก์ชัน -> เป็น "global state" ใช้ร่วมกันทุกที่ที่ import composable นี้
const houses = ref<House[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function fetchHouses() {
  isLoading.value = true
  error.value = null
  const { data, error: err } = await supabase
    .from('houses')
    .select('*')
    .order('sort_order', { ascending: true })

  if (err) {
    error.value = err.message
  } else {
    houses.value = data ?? []
  }
  isLoading.value = false
}

async function addHouse(name: string) {
  const nextOrder = houses.value.length
    ? Math.max(...houses.value.map((h) => h.sort_order)) + 1
    : 0

  const { data, error: err } = await supabase
    .from('houses')
    .insert({ name, sort_order: nextOrder })
    .select()
    .single()

  if (err) throw err
  if (data) houses.value.push(data)
  return data
}

async function renameHouse(id: string, name: string) {
  const { error: err } = await supabase.from('houses').update({ name }).eq('id', id)
  if (err) throw err
  const target = houses.value.find((h) => h.id === id)
  if (target) target.name = name
}

async function deleteHouse(id: string) {
  const { error: err } = await supabase.from('houses').delete().eq('id', id)
  if (err) throw err
  houses.value = houses.value.filter((h) => h.id !== id)
}

/**
 * บันทึกลำดับบ้านใหม่ทั้งชุดหลังจาก user ลากสลับตำแหน่ง
 * รับ array ของ house ที่เรียงลำดับใหม่แล้ว แล้วอัปเดต sort_order ทีละแถวให้ตรงกับตำแหน่ง
 */
async function reorderHouses(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => ({ id, sort_order: index }))
  houses.value = orderedIds
    .map((id) => houses.value.find((h) => h.id === id))
    .filter((h): h is House => Boolean(h))
    .map((h, index) => ({ ...h, sort_order: index }))

  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('houses').update({ sort_order }).eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

export function useHouses() {
  return {
    houses,
    isLoading,
    error,
    fetchHouses,
    addHouse,
    renameHouse,
    deleteHouse,
    reorderHouses,
  }
}
