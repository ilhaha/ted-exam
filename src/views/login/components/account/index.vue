<template>
  <a-form
    ref="formRef"
    :model="form"
    :rules="rules"
    :label-col-style="{ display: 'none' }"
    :wrapper-col-style="{ flex: 1 }"
    size="large"
    @submit="handleLogin"
  >
    <!-- 角色选择（下拉选择框） -->
    <a-form-item field="role">
      <a-select v-model="form.role" placeholder="请选择角色">
        <a-option value="1">考生</a-option>
        <a-option value="2">监考</a-option>
        <a-option value="3">机构</a-option>
      </a-select>
    </a-form-item>

    <a-form-item field="username" hide-label>
      <a-input v-model="form.username" placeholder="请输入用户名" allow-clear />
    </a-form-item>
    <a-form-item field="password" hide-label>
      <a-input-password v-model="form.password" placeholder="请输入密码" />
    </a-form-item>

    <!-- 验证码输入框 -->
    <a-form-item v-if="isCaptchaEnabled" field="captcha" hide-label>
      <a-input v-model="form.captcha" placeholder="请输入验证码" :max-length="4" allow-clear style="flex: 1 1" />
      <div class="captcha-container" @click="getCaptcha">
        <img :src="captchaImgBase64" alt="验证码" class="captcha" />
        <div v-if="form.expired" class="overlay">
          <p>已过期，请刷新</p>
        </div>
      </div>
    </a-form-item>

    <a-form-item>
      <a-row justify="space-between" align="center" class="w-full">
        <a-checkbox v-model="loginConfig.rememberMe">记住我</a-checkbox>
        <div>
          <button class="logon-btn" type="button" @click="handleLoginWindow">考生注册</button>
          <button class="logon-btn" type="button" @click="handleForgotWindow">忘记密码</button>
        </div>
      </a-row>
    </a-form-item>

    <a-form-item>
      <a-space direction="vertical" fill class="w-full">
        <a-button class="btn" type="primary" :loading="loading" html-type="submit" size="large" long>立即登录</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { type FormInstance, Message } from '@arco-design/web-vue'
import { useStorage } from '@vueuse/core'
import { getImageCaptcha } from '@/apis/common'
import { useTabsStore, useUserStore } from '@/stores'
import { encryptByRsa } from '@/utils/encrypt'
import { getRoleFlag } from '@/utils/auth'
import { forgotFormKey, loginFormKey } from '@/utils/inject-keys'
import {findIsAccount} from "@/apis";

const loginConfig = useStorage('login-config', {
  rememberMe: true,
  username: '350525197306124505', // 演示默认值
  password: 'admin123', // 演示默认值
  // username: debug ? 'admin' : '', // 演示默认值
  // password: debug ? 'admin123' : '', // 演示默认值
})
// 是否启用验证码
const isCaptchaEnabled = ref(true)
// 验证码图片
const captchaImgBase64 = ref()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  captcha: '',
  role: '1',
  uuid: '',
  expired: false,
})
const rules: FormInstance['rules'] = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
  captcha: [{ required: isCaptchaEnabled.value, message: '请输入验证码' }],
}

// 验证码过期定时器
let timer
const startTimer = (expireTime: number, curTime = Date.now()) => {
  if (timer) {
    clearTimeout(timer)
  }
  const remainingTime = expireTime - curTime
  if (remainingTime <= 0) {
    form.expired = true
    return
  }
  timer = setTimeout(() => {
    form.expired = true
  }, remainingTime)
}
// 组件销毁时清理定时器
onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

// 获取验证码
const getCaptcha = () => {
  getImageCaptcha().then((res) => {
    const { uuid, img, expireTime, isEnabled } = res.data
    isCaptchaEnabled.value = isEnabled
    captchaImgBase64.value = img
    form.uuid = uuid
    form.expired = false
    startTimer(expireTime, Number(res.timestamp))
  })
}

const userStore = useUserStore()
const tabsStore = useTabsStore()
const router = useRouter()
const loading = ref(false)
// 登录
const handleLogin = async () => {
  try {
    const isInvalid = await formRef.value?.validate()
    if (isInvalid) return
    loading.value = true
    // 验证账号是否存在
    const isAccount = await findIsAccount(encryptByRsa(form.username) || '')
    if (isAccount.data) {
      Message.error('账号未注册')
      return
    }
    await userStore.accountLogin({
      username: encryptByRsa(form.username) || '',
      password: encryptByRsa(form.password) || '',
      captcha: form.captcha,
      uuid: form.uuid,
      role: form.role,
    })
    tabsStore.reset()
    const { redirect, ...othersQuery } = router.currentRoute.value.query
    const { rememberMe } = loginConfig.value
    loginConfig.value.username = rememberMe ? form.username : ''
    const roleFlag = getRoleFlag()
    await router.push({
      path: roleFlag === '1' ? ((redirect as string) || '/') : roleFlag === '2' ? ((redirect as string) || '/invigilate') : ((redirect as string) || '/organization/index'),
      query: {
        ...othersQuery,
      },
    })
    Message.success('欢迎使用')
  } catch (error) {
    console.error(error)
    getCaptcha()
    form.captcha = ''
  } finally {
    loading.value = false
  }
}

const loginWindow = inject(loginFormKey)
const forgotWindow = inject(forgotFormKey)

const handleLoginWindow = () => {
  loginWindow.value = true
}

const handleForgotWindow = () => {
  forgotWindow.value = true
}
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped lang="scss">
.arco-input-wrapper,
:deep(.arco-select-view-single) {
  height: 40px;
  border-radius: 4px;
  font-size: 13px;
}

.arco-input-wrapper.arco-input-error {
  background-color: rgb(var(--danger-1));
  border-color: rgb(var(--danger-3));
}

.arco-input-wrapper.arco-input-error:hover {
  background-color: rgb(var(--danger-1));
  border-color: rgb(var(--danger-6));
}

.arco-input-wrapper :deep(.arco-input) {
  font-size: 13px;
  color: var(--color-text-1);
}

.arco-input-wrapper:hover {
  border-color: rgb(var(--arcoblue-6));
}

.captcha {
  width: 111px;
  height: 36px;
  margin: 0 0 0 5px;
}

.btn {
  height: 40px;
}

.captcha-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(51, 51, 51, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay p {
  font-size: 12px;
  color: white;
}

.logon-btn {
  width: 64px;
  height: 24px;
  color: #165dff;
  border: none;
  margin-right: 15px;
  background-color: white;
}

.logon-btn:hover {
  color: rgb(var(--primary-5));
  background-color: var(--color-fill-2);
}
</style>
