import type { RouteRecordRaw } from 'vue-router'

/** 默认布局 */
const Layout = () => import('@/layout/index.vue')

/** 系统路由 */
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/candidates',
    meta: { hidden: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
      {
    path: '/candidates',
    component: () => import('@/views/candidates/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/startExam',
    name: 'StartExam',
    component: () => import('@/views/candidates/Exam.vue'),
    meta: { hidden: true },
  },
  {
    path: '/examEnd',
    name: 'ExamEnd',
    component: () => import('@/views/candidates/ExamEnd.vue'),
    meta: { hidden: true },
  },
  {
    path: '/invigilator',
    name: 'Invigilator',
    component: () => import('@/views/invigilator/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/invigilatorExamEnd',
    name: 'InvigilatorExamEnd',
    component: () => import('@/views/invigilator/ExamEnd.vue'),
    meta: { hidden: true },
  },
  {
    path: '/social/callback',
    component: () => import('@/views/login/social/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/pwdExpired',
    component: () => import('@/views/login/pwdExpired/index.vue'),
    meta: { hidden: true },
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
