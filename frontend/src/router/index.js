import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login/login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../pages/messages/messages.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message-detail',
    name: 'MessageDetail',
    component: () => import('../pages/message-detail/message-detail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-message',
    name: 'CreateMessage',
    component: () => import('../pages/messages/create-message.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/discussions',
    name: 'Discussions',
    component: () => import('../pages/discussions/discussions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/discussion-detail',
    name: 'DiscussionDetail',
    component: () => import('../pages/discussions/discussion-detail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-discussion',
    name: 'CreateDiscussion',
    component: () => import('../pages/discussions/create-discussion.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../pages/favorites/favorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../pages/stats/stats.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../pages/admin/users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/groups',
    name: 'AdminGroups',
    component: () => import('../pages/admin/groups.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/messages',
    name: 'AdminMessages',
    component: () => import('../pages/admin/messages.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/ai-settings',
    name: 'AdminAiSettings',
    component: () => import('../pages/admin/ai-settings.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router