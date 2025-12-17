import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { resetRouter } from '@/router'
import {
  type AccountLoginReq,
  AuthTypeConstants,
  type EmailLoginReq,
  type PhoneLoginReq,
  type UserInfo,
  accountLogin as accountLoginApi,
  invigilatorLogin as invigilatorLoginApi,
  emailLogin as emailLoginApi,
  getUserInfo as getUserInfoApi,
  logout as logoutApi,
  phoneLogin as phoneLoginApi,
  socialLogin as socialLoginApi,
} from '@/apis'
import { clearToken, setToken, getToken } from '@/utils/auth'
import { resetHasRouteFlag } from '@/router/guard'

const storeSetup = () => {
  const userInfo = reactive<UserInfo>({
    id: '',
    username: '',
    nickname: '',
    gender: 0,
    email: '',
    phone: '',
    avatar: '',
    pwdResetTime: '',
    pwdExpired: false,
    registrationDate: '',
    deptName: '',
    enableProctorWarning: true,
    roles: [],
    permissions: [],
    planId: 0,
    examNumber: '',
    examTime: '',
    examDuration: 0,
    planName: '',
    classroomId: '',
    classroomName: '',
    role: '',
    warningShortFilm: ''
  })



  const nickname = computed(() => userInfo.nickname)
  const username = computed(() => userInfo.username)
  const avatar = computed(() => userInfo.avatar)

  const planId = computed(() => userInfo.planId)
  const examNumber = computed(() => userInfo.examNumber)
  const examTime = computed(() => userInfo.examTime)
  const examDuration = computed(() => userInfo.examDuration)
  const planName = computed(() => userInfo.planName)
  const classroomId = computed(() => userInfo.classroomId)
  const classroomName = computed(() => userInfo.classroomName)
  const role = computed(() => userInfo.role)
  const warningShortFilm = computed(() => userInfo.warningShortFilm)
  const enableProctorWarning = computed(() => userInfo.enableProctorWarning)

  const token = ref(getToken() || '')
  const pwdExpiredShow = ref<boolean>(true)
  const roles = ref<string[]>([]) // 当前用户角色
  const permissions = ref<string[]>([]) // 当前角色权限标识集合

  // 重置token
  const resetToken = () => {
    token.value = ''
    clearToken()
    resetHasRouteFlag()
  }

  // 登录
  const accountLogin = async (req: AccountLoginReq) => {
    const res = await accountLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeConstants.ACCOUNT })
    setToken(res.data.token)
    token.value = res.data.token
    userInfo.planId = res.data.examCandidateInfoVO.planId
    userInfo.examNumber = res.data.examCandidateInfoVO.examNumber
    userInfo.examTime = res.data.examCandidateInfoVO.examTime
    userInfo.examDuration = res.data.examCandidateInfoVO.examDuration
    userInfo.planName = res.data.examCandidateInfoVO.planName
    userInfo.classroomId = res.data.examCandidateInfoVO.classroomId
    userInfo.classroomName = res.data.examCandidateInfoVO.classroomName
    userInfo.role = res.data.role
    userInfo.warningShortFilm = res.data.examCandidateInfoVO.warningShortFilm
    userInfo.enableProctorWarning = res.data.examCandidateInfoVO.enableProctorWarning
  }

  // 开考密码登录
  const invigilatortLogin = async (req: AccountLoginReq) => {
    const res = await invigilatorLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeConstants.ACCOUNT })
    setToken(res.data.token)
    token.value = res.data.token
    userInfo.planId = res.data.examCandidateInfoVO.planId
    userInfo.examTime = res.data.examCandidateInfoVO.examTime
    userInfo.examDuration = res.data.examCandidateInfoVO.examDuration
    userInfo.planName = res.data.examCandidateInfoVO.planName
    userInfo.classroomId = res.data.examCandidateInfoVO.classroomId
    userInfo.classroomName = res.data.examCandidateInfoVO.classroomName
    userInfo.role = res.data.role
  }


  // 邮箱登录
  const emailLogin = async (req: EmailLoginReq) => {
    const res = await emailLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeConstants.EMAIL })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 手机号登录
  const phoneLogin = async (req: PhoneLoginReq) => {
    const res = await phoneLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeConstants.PHONE })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 三方账号登录
  const socialLogin = async (source: string, req: any) => {
    const res = await socialLoginApi({ ...req, source, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeConstants.SOCIAL })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 退出登录回调
  const logoutCallBack = async () => {
    roles.value = []
    permissions.value = []
    pwdExpiredShow.value = true
    resetToken()
    resetRouter()
  }

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi()
      await logoutCallBack()
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  const getInfo = async () => {
    const res = await getUserInfoApi()
    Object.assign(userInfo, res.data)
    if (res.data.roles && res.data.roles.length) {
      roles.value = res.data.roles
      permissions.value = res.data.permissions
    }
  }

  return {
    userInfo,
    nickname,
    username,
    avatar,
    planId,
    planName,
    examNumber,
    examTime,
    examDuration,
    classroomId,
    classroomName,
    warningShortFilm,
    enableProctorWarning,
    token,
    roles,
    permissions,
    pwdExpiredShow,
    role,
    accountLogin,
    emailLogin,
    phoneLogin,
    socialLogin,
    logout,
    logoutCallBack,
    getInfo,
    resetToken,
    invigilatortLogin
  }
}

export const useUserStore = defineStore('user', storeSetup, {
  persist: { paths: ['token', 'roles', 'permissions', 'pwdExpiredShow', 'userInfo', "planId", "classroomId", "role", "warningShortFilm", "enableProctorWarning"], storage: localStorage },
})

