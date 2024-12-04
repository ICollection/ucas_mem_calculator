import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/QAMM/AHP'
    },
    {

      path: '/QAMM/AHP',
      name: 'qamm_ahp',
      component: () => import('../views/QAMM/AHP.vue')
    },
    {

      path: '/CSD/AHP',
      name: 'csd_ahp',
      component: () => import('../views/CSD/AHP.vue')
    },
    {
      path: '/CSD/SSM',
      name: 'csd_ssm',
      component: () => import('../views/CSD/SSM.vue')
    },
  ]
})
export default router