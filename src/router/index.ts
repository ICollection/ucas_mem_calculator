import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationGeneric, type RouteLocationNormalizedGeneric } from 'vue-router'

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
      meta: { title: '层次分析法' },
      component: () => import('../views/QAMM/AHP.vue')
    },
    {

      path: '/CSD/AHP',
      name: 'csd_ahp',
      meta: { title: '层次分析法' },
      component: () => import('../views/CSD/AHP.vue')
    },
    {
      path: '/CSD/SSM',
      name: 'csd_ssm',
      component: () => import('../views/CSD/SSM.vue')
    },
  ]
});
router.beforeEach((to: RouteLocationGeneric, from: RouteLocationNormalizedGeneric, next: NavigationGuardNext) => {
  if (to.meta && to.meta.title)
    document.title = `MEM计算器(${to.meta.title as string})`;
  else
    document.title = 'MEM计算器';
  next();
});
export default router