import { createRouter, createWebHistory } from 'vue-router'
import AccountList from '../views/AccountList.vue'

const routes = [
  {
    path: '/',
    name: 'AccountList',
    component: AccountList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
