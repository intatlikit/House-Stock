<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tag } from '@/types'
import { useTags } from '@/composables/useTags'
import ClearableField from '@/components/ClearableField.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FieldError from '@/components/FieldError.vue'

const props = defineProps<{ tag: Tag }>()

const { renameTag, deleteTag, isTagNameTaken } = useTags()

const isEditing = ref(false)
const draftName = ref(props.tag.name)
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// เตือนชื่อซ้ำกับ tag อื่นทันทีระหว่างพิมพ์ (ไม่นับชื่อเดิมของตัวเอง)
const isDuplicate = computed(
  () => isEditing.value && Boolean(draftName.value.trim()) && isTagNameTaken(draftName.value, props.tag.id),
)
const errorMessage = computed(() => (isDuplicate.value ? 'มี tag ชื่อนี้อยู่แล้ว' : saveError.value))
const canSave = computed(() => Boolean(draftName.value.trim()) && !isDuplicate.value && !isSaving.value)

function startEdit() {
  draftName.value = props.tag.name
  saveError.value = null
  isEditing.value = true
}

async function saveEdit() {
  if (!canSave.value) return
  const trimmed = draftName.value.trim()
  if (trimmed === props.tag.name) {
    isEditing.value = false
    return
  }
  isSaving.value = true
  saveError.value = null
  try {
    await renameTag(props.tag.id, trimmed)
    isEditing.value = false
  } catch (err) {
    saveError.value = (err as Error).message
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
}

async function confirmDelete() {
  isDeleting.value = true
  try {
    await deleteTag(props.tag.id)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <!-- ปกติจัดชื่อให้อยู่กึ่งกลางแนวตั้งกับไอคอน, ตอนแก้ไขชิดบนเพื่อไม่ให้ปุ่มเลื่อนลงเมื่อมีข้อความเตือนใต้ช่อง -->
  <li class="flex gap-3 px-4 py-3" :class="isEditing ? 'items-start' : 'items-center'">
    <div class="min-w-0 flex-1">
      <template v-if="isEditing">
        <ClearableField :show="Boolean(draftName)" @clear="draftName = ''">
          <input
            v-model="draftName"
            type="text"
            autofocus
            class="w-full rounded-[var(--radius-control)] border px-2 py-1 text-sm"
            :class="errorMessage ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'"
            @input="saveError = null"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
          />
        </ClearableField>
        <FieldError :message="errorMessage" />
      </template>
      <p v-else class="truncate text-sm text-[var(--color-text)]">{{ tag.name }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <template v-if="isEditing">
        <button
          type="button"
          :disabled="!canSave"
          class="rounded-full px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] disabled:opacity-50"
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
          class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]"
          :aria-label="`ลบ tag ${tag.name}`"
          title="ลบ tag"
          @click="showDeleteConfirm = true"
        >
          🗑
        </button>
        <button
          type="button"
          class="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          :aria-label="`แก้ไขชื่อ tag ${tag.name}`"
          title="แก้ไขชื่อ"
          @click="startEdit"
        >
          ✎
        </button>
      </template>
    </div>

    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="`ลบ tag '${tag.name}' ?`"
      message="สิ่งของที่ใช้ tag นี้จะไม่ถูกลบ แต่จะกลายเป็นไม่มี tag"
      confirm-label="ลบ tag นี้"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </li>
</template>
