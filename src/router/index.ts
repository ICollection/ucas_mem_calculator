import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationGeneric, type RouteLocationNormalizedGeneric } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/Index'
    },
    {
      path: '/Index',
      name: 'index',
      meta: { title: '目录' },
      component: () => import('../views/Index.vue')
    },
    {

      path: '/QAMM/BAP',
      name: 'qamm_bap',
      meta: { title: '效益分配问题' },
      component: () => import('../views/QAMM/BAP.vue')
    },
    {
      path: '/QAMM/OSM',
      name: 'qamm_osm',
      meta: { title: '优选法' },
      component: () => import('../views/QAMM/OSM.vue')
    },
    {
      path: '/QAMM/SPA',
      name: 'qamm_spa',
      meta: { title: '单纯形法' },
      component: () => import('../views/QAMM/SPA.vue')
    },
    {
      path: '/QAMM/AHP',
      name: 'qamm_ahp',
      meta: { title: '层次分析法' },
      component: () => import('../views/QAMM/AHP.vue')
    },
    {
      path: '/CSD/ISM',
      name: 'csd_ism',
      meta: { title: '解释结构模型' },
      component: () => import('../views/CSD/ISM.vue')
    },
    {
      path: '/CSD/FCA',
      name: 'csd_fca',
      meta: { title: '模糊聚类分析' },
      component: () => import('../views/CSD/FCA.vue')
    },
    {
      path: '/CSD/AHP',
      name: 'csd_ahp',
      meta: { title: '层次分析法' },
      component: () => import('../views/CSD/AHP.vue')
    },
    {
      path: '/CSD/PCA',
      name: 'csd_pca',
      meta: { title: '主成分分析法' },
      component: () => import('../views/CSD/PCA.vue')
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