<script setup lang="ts">
import { watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const { query, isSearching, results, search, close } = useGlobalSearch()

let debounceTimer: ReturnType<typeof setTimeout> | undefined
watch(query, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(value), 300)
})
</script>

<template>
  <BaseModal title="ค้นหาสิ่งของทุกบ้าน" max-width="max-w-2xl" @close="close">
    <input
      :value="query"
      type="text"
      placeholder="พิมพ์ชื่อสิ่งของ หรือ tag..."
      autofocus
      class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
      @input="search(($event.target as HTMLInputElement).value)"
    />

    <div class="mt-4 max-h-[60vh] space-y-5 overflow-y-auto">
      <p v-if="isSearching" class="text-sm text-[var(--color-text-muted)]">กำลังค้นหา...</p>

      <p
        v-else-if="query.trim() && !results.length"
        class="text-sm text-[var(--color-text-muted)]"
      >
        ไม่พบสิ่งของที่ตรงกับ "{{ query }}"
      </p>

      <div v-for="group in results" :key="group.house.id">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {{ group.house.name }}
        </p>
        <ul class="space-y-1.5">
          <li
            v-for="item in group.items"
            :key="item.id"
            class="flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm"
          >
            <span class="font-medium text-[var(--color-text)]">{{ item.name }}</span>
            <span class="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span v-if="item.tag" class="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[var(--color-primary-dark)]">
                {{ item.tag.name }}
              </span>
              จำนวน {{ item.quantity }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </BaseModal>
</template>
