import { ref } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'house-stock-theme'

// global state ตัวเดียวใช้ร่วมกันทั้งแอป
const theme = ref<Theme>('light')

function applyToDocument(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

/** เรียกครั้งเดียวตอนแอปเริ่มทำงาน (ดู main.ts) */
function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
  } else {
    // ไม่เคยตั้งค่าไว้ -> ตามค่า system ของเครื่อง
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  applyToDocument(theme.value)
}

function setTheme(value: Theme) {
  theme.value = value
  localStorage.setItem(STORAGE_KEY, value)
  applyToDocument(value)
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return { theme, initTheme, setTheme, toggleTheme }
}
