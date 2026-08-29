# วิธีตั้งค่าโปรเจกต์ House Stock

## 1. สร้าง Supabase project

1. ไปที่ https://supabase.com/dashboard แล้ว **New project**
2. ตั้งชื่อ project (เช่น `house-stock`), เลือก region ใกล้ตัวที่สุด (เช่น Singapore), ตั้งรหัสผ่าน database ไว้ (เก็บไว้ดีๆ)
3. รอ project สร้างเสร็จ (ประมาณ 1-2 นาที)

## 2. รัน schema (สร้างตาราง)

1. ในเมนูซ้ายของ Supabase Dashboard เลือก **SQL Editor** -> **New query**
2. เปิดไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ คัดลอกทั้งหมด วางในช่อง SQL Editor
3. กด **Run** — จะได้ตาราง `houses`, `tags`, `locations`, `items` พร้อม RLS policy

## 3. ดึงค่า API key

1. ไปที่ **Project Settings** (รูปเฟือง) -> **API**
2. คัดลอกค่า:
   - **Project URL** → ใส่ใน `VITE_SUPABASE_URL`
   - **anon public key** → ใส่ใน `VITE_SUPABASE_ANON_KEY`

## 4. ตั้งค่าโปรเจกต์ในเครื่อง

```bash
cp .env.example .env
# เปิดไฟล์ .env แล้ววางค่าจากขั้นตอนที่ 3

npm install
npm run dev
```

เปิด http://localhost:5173 จะเห็นหน้า landing page

## 5. Push ขึ้น GitHub (version control)

```bash
git init
git remote add origin https://github.com/intatlikit/House-Stock.git
git add .
git commit -m "chore: scaffold House Stock (Vue 3 + TS + Supabase)"
git branch -M main
git push -u origin main
```

> **สำคัญ:** ไฟล์ `.env` จะไม่ถูก push ขึ้น GitHub (อยู่ใน `.gitignore` แล้ว) เพราะมี key จริง
> ส่วน `.env.example` จะถูก push เพื่อให้คนอื่น/เครื่องอื่นรู้ว่าต้องตั้งค่าอะไรบ้าง

## ขั้นถัดไป (ยังไม่ได้ทำในรอบนี้)

- **GitHub Actions pipeline** สำหรับ deploy อัตโนมัติ (fast lane) — ต้องรู้ก่อนว่าจะ deploy ไปที่ไหน (Vercel / Netlify / Cloudflare Pages ฯลฯ) เพื่อตั้ง secret ให้ตรง
- Widget เพิ่มเติมในหน้า landing (มีพื้นที่เตรียมไว้ให้แล้วที่ `src/pages/LandingPage.vue` ส่วน `data-widget-area`)
