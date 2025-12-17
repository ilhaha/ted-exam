/** 用户类型 */
export interface UserInfo {
  id: string
  username: string
  nickname: string
  gender: 0 | 1 | 2
  email: string
  phone: string
  avatar: string
  pwdResetTime: string
  pwdExpired: boolean
  registrationDate: string
  deptName: string
  roles: string[]
  permissions: string[],
  planId: number,
  examNumber: string,
  examTime: string,
  planName: string,
  classroomId: string,
  classroomName: string,
  examDuration: number,
  role: string,
  warningShortFilm: string,
  enableProctorWarning: true,
}


export interface ExamCandidateInfoVO {
  planId: number
  examNumber: string
  examTime: string
  examDuration: number,
  planName: string
  classroomId: string
  classroomName: string
  role: string
  warningShortFilm: string,
  enableProctorWarning: boolean,
}

/** 路由类型 */
export interface RouteItem {
  id: string
  title: string
  parentId: string
  type: 1 | 2 | 3
  path: string
  name: string
  component: string
  redirect: string
  icon: string
  isExternal: boolean
  isHidden: boolean
  isCache: boolean
  permission: string
  roles: string[]
  sort: number
  status: 0 | 1
  children: RouteItem[]
  activeMenu: string
  alwaysShow: boolean
  breadcrumb: boolean
  showInTabs: boolean
  affix: boolean
}

/** 认证类型 */
export type AuthType = 'ACCOUNT' | 'PHONE' | 'EMAIL' | 'SOCIAL'

export const AuthTypeConstants = {
  ACCOUNT: 'ACCOUNT',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  SOCIAL: 'SOCIAL',
} as const

/** 基础认证请求接口 */
export interface AuthReq {
  clientId?: string
  authType?: AuthType
}

/** 账号登录请求参数 */
export interface AccountLoginReq extends AuthReq {
  username: string
  password: string
  examNumber: string
  planName: string,
  classroomId: string,
  classroomName: string
}

/** 手机号登录请求参数 */
export interface PhoneLoginReq extends AuthReq {
  phone: string
  captcha: string
}

/** 邮箱登录请求参数 */
export interface EmailLoginReq extends AuthReq {
  email: string
  captcha: string
}

/** 登录响应类型 */
export interface LoginResp {
  token: string,
  examNumber: string,
  examTime: string,
  examCandidateInfoVO: ExamCandidateInfoVO,
  role: string
}

/** 第三方登录授权类型 */
export interface SocialAuthAuthorizeResp {
  authorizeUrl: string
}
