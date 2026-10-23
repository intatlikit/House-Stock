<script setup lang="ts">
// ข้อความเตือนสีแดงใต้ช่องกรอก (เช่น ชื่อซ้ำ) — ไม่มีข้อความก็ไม่แสดง
defineProps<{ message?: string | null }>()
</script>

<template>
  <p v-if="message" class="mt-1 text-xs text-[var(--color-danger)]">{{ message }}</p>
</template>
