<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BackButton from '@/components/BackButton.vue'
import SettingsSection from '@/components/SettingsSection.vue'
import SettingsRow from '@/components/SettingsRow.vue'
import { APP_VERSION } from '@/lib/version'

const router = useRouter()

// กลับหน้าก่อนหน้า (เช่นหน้าบ้านที่เปิดอยู่) ถ้าเปิดหน้านี้ตรงๆ จาก URL ให้กลับหน้ารายการบ้าน
function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'landing' })
}
</script>

<template>
  <div class="min-h-full">
    <AppHeader>
      <template #left>
        <BackButton label="ตั้งค่า" @click="goBack" />
      </template>
    </AppHeader>

    <!-- เพิ่มเมนูใหม่: เพิ่ม SettingsSection / SettingsRow ในนี้ -->
    <main class="mx-auto max-w-2xl space-y-6 px-4 pt-6 pb-24 sm:px-6">
      <SettingsSection title="ข้อมูล">
        <SettingsRow label="แก้ไข tag" clickable @click="router.push({ name: 'settings-tags' })" />
      </SettingsSection>

      <SettingsSection title="เกี่ยวกับ">
        <SettingsRow label="เวอร์ชัน" :value="`v${APP_VERSION}`" />
      </SettingsSection>
    </main>
  </div>
</template>
