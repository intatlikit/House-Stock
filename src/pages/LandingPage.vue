<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import HouseList from '@/components/HouseList.vue'
import AddHouseModal from '@/components/AddHouseModal.vue'
import FabButton from '@/components/FabButton.vue'
import GlobalSearchModal from '@/components/GlobalSearchModal.vue'
import { useHouses } from '@/composables/useHouses'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const { houses, fetchHouses, isLoading } = useHouses()
const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useGlobalSearch()

const showAddHouse = ref(false)

onMounted(fetchHouses)
</script>

<template>
  <div class="min-h-full">
    <AppHeader />

    <!-- pb-24 กันไม่ให้ปุ่มลอยบังเนื้อหาด้านล่างสุด -->
    <main class="mx-auto max-w-5xl space-y-6 px-4 pt-6 pb-24 sm:px-6">
      <!-- ช่องค้นหาสิ่งของจากบ้านทั้งหมด -->
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] shadow-sm"
        @click="openSearch"
      >
        <span aria-hidden="true">🔍</span>
        ค้นหาสิ่งของจากทุกบ้าน...
      </button>

      <section>
        <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">บ้านของฉัน</h2>
        <p v-if="isLoading" class="text-sm text-[var(--color-text-muted)]">กำลังโหลด...</p>
        <HouseList v-else :houses="houses" />
      </section>

      <!--
        พื้นที่สำหรับ widget เพิ่มเติมในอนาคต (เช่น สรุปของใกล้หมดอายุ, กราฟค่าใช้จ่าย)
        วาง grid ไว้รองรับล่วงหน้า เพิ่ม widget ใหม่โดยใส่ component ลงใน div นี้ได้เลย
      -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2" data-widget-area>
        <!-- <FutureWidget /> -->
      </section>
    </main>

    <FabButton label="เพิ่มบ้าน" @click="showAddHouse = true" />

    <AddHouseModal v-if="showAddHouse" @close="showAddHouse = false" />
    <GlobalSearchModal v-if="isSearchOpen" @close="closeSearch" />
  </div>
</template>
