import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/cnm.vue"
import Login from "../components/login.vue"
import Register from "../components/register.vue"
import organization from '../layouts/organization.vue'
import adopter from '../layouts/adopter.vue'
import admin from '../layouts/admin.vue'
import profile from '../components/profile.vue'
import pets from '../pages/pets.vue'
import products from '../pages/products.vue'
import community from '../pages/community.vue'
import postDetailPage from '../pages/postDetail.vue'
import adoption from '../pages/adoption.vue'
import adoptionApplications from '../pages/adoptionApplications.vue'
import adoptionContracts from '../pages/adoptionContracts.vue'
import adopterAdoption from '../pages/adopterAdoption.vue'
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
      },
      {
        path: 'adoption',
        name: 'adoption',
        component: adoption
      },
      {
        path: 'adoption/applications',
        name: 'adoptionApplications',
        component: adoptionApplications
      },
      {
        path: 'adoption/contracts',
        name: 'adoptionContracts',
        component: adoptionContracts
      }
    ]
  },
  {
    path: '/adopter',
    name: 'adopter',
    component: adopter,
    children: [
      {
        path: 'profile',
        name: 'adopterProfile',
        component: profile
      },
      {
        path: 'pets',
        name: 'adopterPets',
        component: pets
      },
      {
        path: 'products',
        name: 'adopterProducts',
        component: products
      },
      {
        path: 'community',
        name: 'adopterCommunity',
        component: community,
      },
      {
        path: 'community/post/:id',
        name: 'adopterPostDetail',
        component: postDetailPage
      },
      {
        path: 'adoption',
        name: 'adopterAdoption',
        component: adopterAdoption
      },
      {
        path: 'adoption/applications',
        name: 'adopterAdoptionApplications',
        component: adoptionApplications
      },
      {
        path: 'adoption/contracts',
        name: 'adopterAdoptionContracts',
        component: adoptionContracts
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    component: admin,
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: () => import('../pages/adminDashboard.vue')
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: profile
      },
      {
        path: 'users/list',
        name: 'adminUsersList',
        component: () => import('../pages/adminUsers.vue')
      },
      {
        path: 'users/roles',
        name: 'adminUsersRoles',
        component: () => import('../pages/adminRoles.vue')
      },
      {
        path: 'pets/list',
        name: 'adminPetsList',
        component: pets
      },
      {
        path: 'pets/categories',
        name: 'adminPetsCategories',
        component: () => import('../pages/adminPetCategories.vue')
      },
      {
        path: 'adoption/applications',
        name: 'adminAdoptionApplications',
        component: adoptionApplications
      },
      {
        path: 'adoption/contracts',
        name: 'adminAdoptionContracts',
        component: adoptionContracts
      },
      {
        path: 'adoption/statistics',
        name: 'adminAdoptionStatistics',
        component: () => import('../pages/adminAdoptionStats.vue')
      },
      {
        path: 'products/list',
        name: 'adminProductsList',
        component: products
      },
      {
        path: 'products/orders',
        name: 'adminProductsOrders',
        component: () => import('../pages/adminOrders.vue')
      },
      {
        path: 'community/posts',
        name: 'adminCommunityPosts',
        component: community
      },
      {
        path: 'community/comments',
        name: 'adminCommunityComments',
        component: () => import('../pages/adminComments.vue')
      },
      {
        path: 'community/reports',
        name: 'adminCommunityReports',
        component: () => import('../pages/adminReports.vue')
      },
      {
        path: 'system/config',
        name: 'adminSystemConfig',
        component: () => import('../pages/adminSystemConfig.vue')
      },
      {
        path: 'system/logs',
        name: 'adminSystemLogs',
        component: () => import('../pages/adminSystemLogs.vue')
      },
      {
        path: 'system/backup',
        name: 'adminSystemBackup',
        component: () => import('../pages/adminSystemBackup.vue')
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
