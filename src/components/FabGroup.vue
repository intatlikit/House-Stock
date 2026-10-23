<template>
  <!-- กลุ่มปุ่มลอยมุมขวาล่าง: ใส่ FabButton ได้หลายปุ่ม เรียงจากซ้ายไปขวา (ปุ่มหลักไว้ขวาสุด) -->
  <div
    class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 sm:right-6"
  >
    <slot />
  </div>
</template>
