import type { RouteRecordRaw } from 'vue-router'

/** 默认布局 */
const Layout = () => import('@/layout/index.vue')

/** 系统路由 */
export const systemRoutes: RouteRecordRaw[] = [

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
  /* 公告 轮播图页 */
  {
    path: '/carousel/:id',
    name: 'Carousel',
    component: () => import('@/views/login/components/info/carousel.vue'),
    meta: { },
    props: true,
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Layout,
    redirect: '/home',
    meta: { },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { },
      },
      {
        path: '/training/:id',
        name: 'TrainingDetail',
        component: () => import('@/views/training/TrainingDetail.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/setting/profile',
        name: 'SettingProfile',
        component: () => import('@/views/setting/profile/index.vue'),
        meta: { title: '个人中心', showInTabs: false },
      },
      // {
      //   path: '/setting/message',
      //   name: 'SettingMessage',
      //   component: () => import('@/views/setting/message/index.vue'),
      //   meta: { title: '消息中心', showInTabs: false },
      // },
      {
        path: '/setting/message',
        name: 'SettingMessage',
        component: () => import('@/views/setting/message/index.vue'),
        meta: { title: '消息中心', showInTabs: false },
      },
    ],
  },
  {
    path: '/organization',
    name: 'Organization',
    component: Layout,
    meta: { },
    props: true,
    children: [
      {
        path: '/organization/index',
        name: 'OrganizationDetail',
        component: () => import('@/views/organization/organizationIndex.vue'),
        meta: { },
        props: true,
      },
    ],
  },
  {
    path: '/invigilate',
    name: 'Invigilate',
    component: Layout,
    redirect: { name: 'InvigilateDetail' },
    children: [
      {
        path: 'index',
        name: 'InvigilateDetail',
        component: () => import('@/views/invigilate/index.vue'),
        meta: {
          title: '监考管理',
          requiresAuth: true,
        },
      },
    ],
  },
]

// 固定路由（默认路由）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/default/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/default/error/404.vue'),
    meta: { hidden: true },
  },
  {
    path: '/403',
    component: () => import('@/views/default/error/403.vue'),
    meta: { hidden: true },
  },
]
