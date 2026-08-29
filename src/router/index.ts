import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  ],
})

export default router
