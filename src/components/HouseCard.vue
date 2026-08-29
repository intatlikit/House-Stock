<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { House } from '@/types'
import { useHouses } from '@/composables/useHouses'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps<{ house: House }>()

const router = useRouter()
const { renameHouse, deleteHouse } = useHouses()

const isEditing = ref(false)
const draftName = ref(props.house.name)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

function openHouse() {
  if (isEditing.value) return
  router.push({ name: 'house-detail', params: { id: props.house.id } })
}

function startEdit(e: Event) {
  e.stopPropagation()
  draftName.value = props.house.name
  isEditing.value = true
}

async function saveEdit() {
  const trimmed = draftName.value.trim()
  if (trimmed && trimmed !== props.house.name) {
    await renameHouse(props.house.id, trimmed)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

async function confirmDelete() {
  isDeleting.value = true
  try {
    await deleteHouse(props.house.id)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div
    class="group flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition hover:shadow-md"
    @click="openHouse"
  >
    <span
      class="cursor-grab select-none text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100"
      title="ลากเพื่อจัดลำดับ"
      aria-hidden="true"
    >
      ⠿
    </span>

    <div class="min-w-0 flex-1">
      <input
        v-if="isEditing"
        v-model="draftName"
        type="text"
        autofocus
        class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-2 py-1 text-sm"
        @click.stop
        @keyup.enter="saveEdit"
        @keyup.esc="cancelEdit"
      />
      <p v-else class="truncate text-sm font-semibold text-[var(--color-text)]">
        {{ house.name }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-1" @click.stop>
      <template v-if="isEditing">
        <button
          type="button"
          class="rounded-full px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          @click="saveEdit"
        >
          บันทึก
        </button>
        <button
          type="button"
          class="rounded-full px-2 py-1 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          @click="cancelEdit"
        >
          ยกเลิก
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          aria-label="แก้ไขชื่อบ้าน"
          @click="startEdit"
        >
          ✎
        </button>
        <button
          type="button"
          class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]"
          aria-label="ลบบ้าน"
          @click="showDeleteConfirm = true"
        >
          🗑
        </button>
      </template>
    </div>

    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="`ลบ '${house.name}' ?`"
      message="สิ่งของทั้งหมดในบ้านนี้จะถูกลบไปด้วย และไม่สามารถกู้คืนได้"
      confirm-label="ลบบ้านนี้"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
