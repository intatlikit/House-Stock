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

- Widget เพิ่มเติมในหน้า landing (มีพื้นที่เตรียมไว้ให้แล้วที่ `src/pages/LandingPage.vue` ส่วน `data-widget-area`)

## 6. ตั้งค่า Deploy อัตโนมัติ (GitHub Actions → GitHub Pages)

Pipeline อยู่ที่ `.github/workflows/deploy.yml` แล้ว ทุกครั้งที่ push เข้า branch `main` จะ build แล้ว deploy อัตโนมัติ แต่ต้องตั้งค่า **2 อย่าง** ใน GitHub ก่อนใช้งานได้จริง:

### 6.1 เพิ่ม Secrets (สำหรับให้ build เชื่อม Supabase ได้)

ไปที่ repo บน GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** เพิ่ม 2 ตัว:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | ค่าเดียวกับใน `.env` |
| `VITE_SUPABASE_ANON_KEY` | ค่าเดียวกับใน `.env` |

### 6.2 เปิดใช้ GitHub Pages แบบ "GitHub Actions"

ไปที่ repo → **Settings** → **Pages** → หัวข้อ **Build and deployment** → **Source** เลือก **GitHub Actions** (ไม่ใช่ "Deploy from a branch")

### 6.3 Push แล้วรอ

```bash
git add .
git commit -m "ci: add GitHub Pages deploy pipeline"
git push
```

ไปดูสถานะได้ที่แท็บ **Actions** ของ repo พอ deploy เสร็จ เว็บจะอยู่ที่:

```
https://intatlikit.github.io/House-Stock/
```

> หมายเหตุ: โปรเจกต์นี้ตั้ง router เป็น **hash mode** (URL จะมี `#` เช่น `/#/house/xxx`) เพราะ GitHub Pages เป็น static hosting ไม่รองรับ SPA history mode ตรงๆ — เข้าใจง่ายและกันหน้า 404 ตอน refresh ได้เลยโดยไม่ต้องตั้งค่าเพิ่ม

