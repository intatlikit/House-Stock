import { createRouter, createWebHashHistory } from 'vue-router'

// ใช้ hash history (URL จะมี #) เพราะ GitHub Pages เป็น static hosting
// ไม่รองรับ server-side rewrite ให้ SPA แบบ history mode ปกติ
// รีเฟรชหน้า /#/house/xxx จะทำงานถูกต้องเสมอโดยไม่ต้องตั้งค่าเพิ่ม
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/LandingPage.vue'),
    },
    {
      path: '/house/:id',
      name: 'house-detail',
      component: () => import('@/pages/HouseDetailPage.vue'),
      props: true,
    },
    {
      path: '/move',
      name: 'move-items',
      component: () => import('@/pages/MoveItemsPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
    {
      path: '/settings/tags',
      name: 'settings-tags',
      component: () => import('@/pages/TagSettingsPage.vue'),
    },
  ],
})

export default router
