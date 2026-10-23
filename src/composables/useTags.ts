import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tag } from '@/types'

const tags = ref<Tag[]>([])
const isLoading = ref(false)

// code ของ Postgres เมื่อชนกับ unique constraint (tags.name)
const UNIQUE_VIOLATION = '23505'
const DUPLICATE_MESSAGE = 'มี tag ชื่อนี้อยู่แล้ว'

/** เรียงชื่อ tag: ขึ้นต้นด้วยภาษาอังกฤษก่อน แล้วตามด้วยภาษาอื่น (ไทย ฯลฯ) — ในกลุ่มเดียวกันเรียงตามตัวอักษร */
function compareTagNames(a: string, b: string) {
  const aIsEnglish = /^[a-z]/i.test(a)
  const bIsEnglish = /^[a-z]/i.test(b)
  if (aIsEnglish !== bIsEnglish) return aIsEnglish ? -1 : 1
  return a.localeCompare(b, 'th', { sensitivity: 'base' })
}

const sortedTags = computed(() => [...tags.value].sort((a, b) => compareTagNames(a.name, b.name)))

async function fetchTags() {
  isLoading.value = true
  const { data, error } = await supabase.from('tags').select('*').order('name')
  if (!error) tags.value = data ?? []
  isLoading.value = false
}

/** มี tag ชื่อนี้อยู่แล้วหรือไม่ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) — excludeId ใช้ตอนแก้ชื่อ เพื่อไม่นับ tag ตัวเอง */
function isTagNameTaken(name: string, excludeId?: string) {
  const normalized = name.trim().toLowerCase()
  return tags.value.some((t) => t.id !== excludeId && t.name.toLowerCase() === normalized)
}

// แปลง error ชื่อซ้ำจาก DB (เช่นมีคนเพิ่มจากอีกเครื่อง) เป็นข้อความภาษาไทย
function toTagError(error: { code?: string; message: string }) {
  return new Error(error.code === UNIQUE_VIOLATION ? DUPLICATE_MESSAGE : error.message)
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

/** เพิ่ม tag ใหม่จากหน้าแก้ไข tag — ชื่อซ้ำจะ throw แทนการคืน tag เดิม */
async function addTag(name: string): Promise<Tag> {
  const trimmed = name.trim()
  if (isTagNameTaken(trimmed)) throw new Error(DUPLICATE_MESSAGE)

  const { data, error } = await supabase.from('tags').insert({ name: trimmed }).select().single()
  if (error) throw toTagError(error)
  tags.value.push(data)
  return data
}

async function renameTag(id: string, name: string) {
  const trimmed = name.trim()
  if (isTagNameTaken(trimmed, id)) throw new Error(DUPLICATE_MESSAGE)

  const { error } = await supabase.from('tags').update({ name: trimmed }).eq('id', id)
  if (error) throw toTagError(error)
  tags.value = tags.value.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
}

/** ลบ tag — สิ่งของที่ใช้ tag นี้จะกลายเป็นไม่มี tag (DB ตั้ง on delete set null ไว้) */
async function deleteTag(id: string) {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw error
  tags.value = tags.value.filter((t) => t.id !== id)
}

export function useTags() {
  return {
    tags,
    sortedTags,
    isLoading,
    fetchTags,
    isTagNameTaken,
    getOrCreateTag,
    addTag,
    renameTag,
    deleteTag,
  }
}
