import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/cnm.vue"
import Login from "../components/login.vue"
import Register from "../components/register.vue"
import organization from '../layouts/organization.vue'
import profile from '../components/profile.vue'
import pets from '../pages/pets.vue'
import products from '../pages/products.vue'
import community from '../pages/community.vue'
import postDetailPage from '../pages/postDetail.vue'
const routes = [
  { path: '/', redirect: '/register' },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/organization',
    name: 'organization',
    component: organization,
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: profile
      },
      {
        path: 'pets',
        name: 'pets',
        component: pets
      },
      {
        path: 'products',
        name: 'products',
        component: products
      },
      {
        path: 'community',
        name: 'community',
        component: community,
      },
      {
        path: 'community/post/:id',
        name: 'PostDetail',
        component: postDetailPage
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
