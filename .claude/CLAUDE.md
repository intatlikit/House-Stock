# CLAUDE.md

เว็บแอปเก็บ stock ของใช้ในบ้าน แยกตามบ้าน พร้อมแจ้งวันหมดอายุ — Vue 3 + TypeScript + Tailwind v4 + Supabase, deploy ขึ้น GitHub Pages

> **กฎ: Claude ต้องตอบกลับผู้ใช้เป็นภาษาไทยเสมอ** (ชื่อไฟล์ / โค้ด / คำศัพท์เทคนิคใช้ภาษาอังกฤษได้ตามปกติ)

## คำสั่ง

```bash
npm run dev       # dev server ที่ http://localhost:5173
npm run build     # vue-tsc -b (type-check) แล้ว vite build -> dist/
npm run preview   # preview production build
```

- ยังไม่มี test runner และ linter — ใช้ `npm run build` เป็นตัวตรวจ type หลังแก้โค้ดทุกครั้ง
- ต้องมีไฟล์ `.env` (copy จาก `.env.example`) ที่มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`

## สถาปัตยกรรม

- **ไม่มี backend ของตัวเอง** — frontend คุยกับ Supabase ตรงผ่าน anon key ([src/lib/supabase.ts](../src/lib/supabase.ts))
- **Global state ด้วย composables ไม่ใช้ Pinia** — ประกาศ `ref` ไว้ระดับ module (นอกฟังก์ชัน) แล้ว `useXxx()` คืน ref ชุดเดียวกันให้ทุกที่ ดูแบบอย่างที่ [src/composables/useHouses.ts](../src/composables/useHouses.ts)
  - action ที่เขียน DB: เรียก Supabase ก่อน, `throw` error ถ้าพลาด, แล้วค่อยอัปเดต state ใน memory (ยกเว้น `reorderHouses` ที่อัปเดต state ก่อนเพื่อให้ UI ลื่น)
  - action ที่โหลดข้อมูล: เซ็ต `isLoading` / `error` แทนการ throw
- `useItems` เก็บ item ของทุกบ้านใน `itemsByHouse` (key = `house_id`) และ join `tag` / `location` ด้วย `SELECT_WITH_RELATIONS`
- Default sort ของ item: วันหมดอายุใกล้สุดก่อน (ที่ไม่มีวันหมดอายุต่อท้าย) → วันหมดอายุเท่ากันเรียงตามชื่อ (ก-ฮ / A-Z) → ชื่อซ้ำกันตาม `created_at` เก่าสุดก่อน (`defaultSortItems` ใน `useItems.ts`)
- Router ใช้ **hash history** (`/#/house/:id`) เพราะ GitHub Pages ไม่รองรับ SPA rewrite — อย่าเปลี่ยนเป็น `createWebHistory`
- `vite.config.ts` ตั้ง `base: '/House-Stock/'` ตอน build — ถ้าเปลี่ยนชื่อ repo ต้องแก้ตรงนี้ด้วย
- Alias `@` → `src/`

## โครงสร้าง

```
src/
  pages/        LandingPage (รายการบ้าน), HouseDetailPage (stock ของบ้าน)
  components/   UI ย่อย, modal ทุกตัวครอบด้วย BaseModal (Teleport ไป body)
  composables/  useHouses, useItems, useTags, useLocations, useGlobalSearch
  lib/          supabase client, APP_VERSION (อ่านจาก package.json)
  types/        interface ของ row ใน DB + view model + form payload
supabase/schema.sql   schema + RLS สำหรับรันใน Supabase SQL Editor
```

## Database

- ตาราง: `houses`, `items`, `tags`, `locations` — `items.house_id` cascade delete, `tag_id` / `location_id` เป็น set null
- `items.updated_at` อัปเดตอัตโนมัติด้วย trigger
- RLS เปิดอยู่แต่ policy ให้ anon เข้าถึงได้ทั้งหมด (ยังไม่มีระบบ login)
- ถ้าแก้ schema: แก้ `supabase/schema.sql` **และ** type ใน [src/types/index.ts](../src/types/index.ts) ให้ตรงกัน แล้วแจ้งผู้ใช้ว่าต้องรัน SQL เองใน Supabase Dashboard

## สไตล์โค้ด

- Vue SFC ใช้ `<script setup lang="ts">`, `defineProps` / `defineEmits` แบบ type-based
- Comment และข้อความ UI เป็น **ภาษาไทย**
- สี / radius ใช้ design token จาก `@theme` ใน [src/style.css](../src/style.css) ผ่าน `bg-[var(--color-surface)]` ฯลฯ — อย่า hardcode สีใหม่
- เว็บเป็น **dark mode อย่างเดียว** — ไม่มี light mode / ปุ่มสลับธีม, token ใน `@theme` เป็นค่าโทนมืดโดยตรง
- โทนสีถนอมสายตา (เขียวเสจ, ไม่ใช้ขาว/ดำสนิท) — ของใหม่ควรเข้ากับโทนเดิม
- **กฎ: ทุกช่องที่พิมพ์ข้อความได้ต้องมีปุ่ม ✕ ล้างค่า** — ครอบ `<input>` ด้วย [ClearableField](../src/components/ClearableField.vue) (`:show` = มีค่าอยู่, `@clear` = ตั้งค่าว่างเอง เช่น `''` หรือ `null` สำหรับช่องตัวเลขที่ไม่บังคับ) ยกเว้นช่องจำนวน (ทั้ง QuantityStepper ที่มีปุ่ม +/- และช่องจำนวนในฟอร์ม), select และช่องวันที่

## Deploy

- Push เข้า `main` → GitHub Actions ([.github/workflows/main.yml](../.github/workflows/main.yml)) build แล้ว deploy ขึ้น GitHub Pages
- ค่า Supabase ตอน build มาจาก repo secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- ออก version ใหม่: bump `version` ใน `package.json` — `APP_VERSION` จะอัปเดตตาม
