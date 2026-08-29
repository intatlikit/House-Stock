import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Location } from '@/types'

const locations = ref<Location[]>([])
const isLoading = ref(false)

async function fetchLocations() {
  isLoading.value = true
  const { data, error } = await supabase.from('locations').select('*').order('name')
  if (!error) locations.value = data ?? []
  isLoading.value = false
}

/** หาสถานที่ซื้อที่มีชื่อนี้อยู่แล้ว หรือสร้างใหม่ */
async function getOrCreateLocation(name: string): Promise<Location> {
  const trimmed = name.trim()
  const existing = locations.value.find((l) => l.name.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing

  const { data, error } = await supabase
    .from('locations')
    .insert({ name: trimmed })
    .select()
    .single()
  if (error) throw error
  locations.value.push(data)
  return data
}

export function useLocations() {
  return { locations, isLoading, fetchLocations, getOrCreateLocation }
}
