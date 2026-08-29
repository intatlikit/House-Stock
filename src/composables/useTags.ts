import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tag } from '@/types'

const tags = ref<Tag[]>([])
const isLoading = ref(false)

async function fetchTags() {
  isLoading.value = true
  const { data, error } = await supabase.from('tags').select('*').order('name')
  if (!error) tags.value = data ?? []
  isLoading.value = false
}

/** หา tag ที่มีชื่อนี้อยู่แล้ว หรือสร้างใหม่ถ้ายังไม่มี (ใช้ตอนเพิ่มสิ่งของแล้วพิมพ์ tag ใหม่) */
async function getOrCreateTag(name: string): Promise<Tag> {
  const trimmed = name.trim()
  const existing = tags.value.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing

  const { data, error } = await supabase.from('tags').insert({ name: trimmed }).select().single()
  if (error) throw error
  tags.value.push(data)
  return data
}

export function useTags() {
  return { tags, isLoading, fetchTags, getOrCreateTag }
}
