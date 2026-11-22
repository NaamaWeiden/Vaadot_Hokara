import { isBootstrapped } from '@/bootstrap/stores'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

router.beforeEach(async (to, from, next) => {

  await isBootstrapped()

  next()

})

export default router
