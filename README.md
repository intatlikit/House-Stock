# House Stock

เว็บแอปสำหรับเก็บข้อมูลสิ่งของใช้ในบ้านที่ซื้อเข้ามา แยกตามบ้าน พร้อมแจ้งวันหมดอายุ

## Stack

- **Frontend:** Vue 3.4+, TypeScript, Composition API, Composables (global state), Tailwind CSS v4
- **Backend/DB:** Supabase (Postgres + Row Level Security)
- **Deploy:** GitHub Actions (ยังไม่ตั้งค่า — ดู `SETUP.md`)

## เริ่มต้นใช้งาน

ดูขั้นตอนละเอียดที่ **[SETUP.md](./SETUP.md)** — ครอบคลุมการสร้าง Supabase project, รัน schema, ตั้งค่า `.env`, และ push ขึ้น GitHub

สรุปย่อ:

```bash
cp .env.example .env   # แล้วใส่ Supabase URL/anon key ของคุณ
npm install
npm run dev
```

## โครงสร้างโปรเจกต์

```
src/
  components/     UI components แยกเป็นชิ้นๆ (HouseCard, ItemTable, modal ต่างๆ)
  composables/    global state + logic (useHouses, useItems, useTags, useLocations, useGlobalSearch)
  pages/          LandingPage (รายชื่อบ้าน), HouseDetailPage (stock ของบ้านนั้น)
  router/         Vue Router config
  lib/            supabase client, app version
  types/          TypeScript interfaces ที่ใช้ร่วมกัน
supabase/
  schema.sql      SQL สร้างตาราง + RLS policy สำหรับรันใน Supabase SQL Editor
```

## Scripts

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | รัน dev server |
| `npm run build` | type-check + build production |
| `npm run preview` | preview production build |

## ฟีเจอร์หลัก

- จัดการบ้าน: เพิ่ม / แก้ชื่อ / ลบ (มี confirm ก่อนลบ) / ลากสลับลำดับ
- ค้นหาสิ่งของข้ามทุกบ้าน แสดงผลแบบ popup แยกตามบ้าน
- Stock แต่ละบ้าน: ตาราง sort ได้ทุกคอลัมน์, default sort ตามวันหมดอายุใกล้สุด → วันที่เพิ่มเก่าสุด
- เพิ่ม/แก้/ลบ/ดูรายละเอียดสิ่งของ ผ่าน popup, เลือกหรือสร้าง tag และสถานที่ซื้อใหม่ได้ในฟอร์มเดียว
- รองรับ responsive, ตารางแสดงเต็มความกว้างแล้วให้ scroll ซ้าย-ขวา
- ทุกการแก้ไข sync ผ่าน Supabase ทันที ใช้ได้จากหลาย device
