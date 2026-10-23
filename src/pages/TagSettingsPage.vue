<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BackButton from '@/components/BackButton.vue'
import SearchField from '@/components/SearchField.vue'
import TagListItem from '@/components/TagListItem.vue'
import AddTagModal from '@/components/AddTagModal.vue'
import FabGroup from '@/components/FabGroup.vue'
import FabButton from '@/components/FabButton.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
import { useTags } from '@/composables/useTags'

const router = useRouter()
const { sortedTags, isLoading, fetchTags } = useTags()

const searchQuery = ref('')
const showAddTag = ref(false)

const filteredTags = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedTags.value
  return sortedTags.value.filter((tag) => tag.name.toLowerCase().includes(q))
})

// กลับหน้าตั้งค่า ถ้าเปิดหน้านี้ตรงๆ จาก URL ก็ไปหน้าตั้งค่าเช่นกัน
function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'settings' })
}

onMounted(fetchTags)
</script>

<template>
  <div class="min-h-full">
    <AppHeader>
      <template #left>
        <BackButton label="แก้ไข tag" @click="goBack" />
      </template>
    </AppHeader>

    <!-- pb-24 กันไม่ให้ปุ่มลอยบังเนื้อหาด้านล่างสุด -->
    <main class="mx-auto max-w-2xl space-y-4 px-4 pt-6 pb-24 sm:px-6">
      <SearchField v-model="searchQuery" placeholder="ค้นหา tag..." />

      <p v-if="isLoading && !sortedTags.length" class="text-sm text-[var(--color-text-muted)]">กำลังโหลด...</p>
      <p v-else-if="!sortedTags.length" class="text-sm text-[var(--color-text-muted)]">
        ยังไม่มี tag — กดปุ่ม + เพื่อเพิ่ม
      </p>
      <p v-else-if="!filteredTags.length" class="text-sm text-[var(--color-text-muted)]">ไม่พบ tag ที่ค้นหา</p>
      <ul
        v-else
        class="divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <TagListItem v-for="tag in filteredTags" :key="tag.id" :tag="tag" />
      </ul>
    </main>

    <ScrollTopButton />
    <FabGroup>
      <FabButton label="เพิ่ม tag" @click="showAddTag = true" />
    </FabGroup>

    <AddTagModal v-if="showAddTag" @close="showAddTag = false" />
  </div>
</template>
