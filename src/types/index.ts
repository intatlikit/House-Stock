// ===== Database row types (ตรงกับตารางใน Supabase) =====

export interface House {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface Location {
  id: string
  name: string
}

export interface Item {
  id: string
  house_id: string
  name: string
  tag_id: string | null
  quantity: number
  expiry_date: string | null // ISO date, null = ไม่มีวันหมดอายุ
  price: number | null
  location_id: string | null
  created_at: string // stamp วันเวลาที่เพิ่มเข้าไป
  updated_at: string
}

// ===== View models (join แล้วสำหรับแสดงผล) =====

export interface ItemWithRelations extends Item {
  tag: Tag | null
  location: Location | null
}

export interface HouseWithCount extends House {
  item_count?: number
}

// ===== Form payloads =====

export interface ItemFormPayload {
  name: string
  tag_id: string | null
  new_tag_name?: string | null
  quantity: number
  expiry_date: string | null
  price: number | null
  location_id: string | null
  new_location_name?: string | null
}

export type SortColumn = 'index' | 'name' | 'tag' | 'quantity' | 'expiry_date'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  column: SortColumn
  direction: SortDirection
}

// ===== Global search =====

export interface GlobalSearchResultGroup {
  house: House
  items: ItemWithRelations[]
}
