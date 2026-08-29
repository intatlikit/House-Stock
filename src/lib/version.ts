// อ่าน version จาก package.json (Vite inject ผ่าน import attributes)
// เวลาจะออก release ใหม่ แค่ bump version ใน package.json แล้วเลขจะอัปเดตอัตโนมัติ
import pkg from '../../package.json'

export const APP_VERSION: string = pkg.version
