<script setup lang="ts">
// กลุ่มเมนูในหน้าตั้งค่า: หัวข้อ + การ์ดที่ใส่ SettingsRow หลายแถวใน slot
defineProps<{ title: string }>()
</script>

<template>
  <section>
    <h2 class="mb-2 px-1 text-sm font-semibold text-[var(--color-text-muted)]">{{ title }}</h2>
    <ul
      class="divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <slot />
    </ul>
  </section>
</template>
