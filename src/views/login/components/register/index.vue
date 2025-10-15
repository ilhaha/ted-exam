<template>
  <a-modal
    v-model:visible="loginWindow"
    :mask-closable="false"
    :width="700"
    draggable
    :footer="false"
  >
    <template #title>
      考生注册
    </template>
    <div>
      <a-form
        ref="loginFormRef"
        class="login-form"
        :rules="loginFormRules"
        :model="loginForm"
        :style="{ width: '600px' }"
        @submit="handleSubmit"
      >
        <a-form-item field="username" label="用户名" validate-trigger="blur">
          <a-input v-model="loginForm.username" :max-length="18" placeholder="请输入身份证号" />
        </a-form-item>
        <a-form-item field="nickname" label="姓名" validate-trigger="blur">
          <a-input v-model="loginForm.nickname" :max-length="10" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" validate-trigger="blur">
          <a-input v-model="loginForm.phone" :max-length="11" placeholder="请输入手机号" allow-clear />
        </a-form-item>
        <a-form-item field="captcha" label="验证码">
          <a-input v-model="loginForm.captcha" :max-length="4" placeholder="请输入验证码" allow-clear />
          <a-button
            class="captcha-btn"
            :loading="captchaLoading"
            :disabled="captchaDisable"
            size="large"
            style="margin-left: 10px;"
            @click="onCaptcha"
          >
            {{ captchaBtnName }}
          </a-button>
        </a-form-item>
        <a-form-item field="password" label="密码" validate-trigger="blur">
          <a-input-password v-model="loginForm.password" placeholder="请输入6-10位密码" />
        </a-form-item>
        <a-form-item field="password2" label="确认密码" validate-trigger="blur">
          <a-input-password v-model="loginForm.password2" placeholder="确认密码" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="loading" html-type="submit">注册</a-button>
            <a-button @click="cancelLogin">取消</a-button>
          </a-space>
        </a-form-item>
        <Verify
          ref="verifyRef"
          :captcha-type="captchaType"
          :mode="captchaMode"
          :img-size="{ width: '330px', height: '155px' }"
          @success="getCaptcha"
        />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { type BehaviorCaptchaReq, getSmsCaptcha, getSmsCaptchaStatus, loginIdentity } from '@/apis'
import { encryptByRsa } from '@/utils/encrypt'
import * as Regexp from '@/utils/regexp'
import { loginFormKey } from '@/utils/inject-keys'

const loginWindow = inject(loginFormKey)
const loading = ref(false)

// 点击验证码动画
const captchaLoading = ref(false)
// 验证码按钮
const captchaDisable = ref(false)
const captchaTimer = ref()
// 下次获取验证码等待时间
const captchaTime = ref(60)
const verifyRef = ref<InstanceType<any>>()
const captchaType = ref('blockPuzzle')
const captchaMode = ref('pop')
const captchaBtnName = ref('获取验证码')

// 表单ref
const loginFormRef = ref(null)
// 表单数据
const loginForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  captcha: '',
  password: '',
  password2: '',
})

// 表单验证规则
const loginFormRules = {
  username: [
    {
      required: true,
      message: '请输入身份证号',
    },
    {
      validator: (value, cb) => {
        if (/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/i.test(value)) {
          cb()
        } else {
          cb('证件号格式错误')
        }
      },
    },
  ],
  nickname: [{ required: true, message: '请输入姓名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { match: Regexp.Phone, message: '请输入正确的手机号' },
  ],
  captcha: [{ required: true, message: '请输入验证码' }],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
    {
      validator: (value, cb) => {
        if (value.length < 6 || value.length > 10) {
          cb('密码长度位于8-32之间，至少包含字母和数字')
        } else {
          cb()
        }
      },
    },
  ],
  password2: [
    {
      required: true,
      message: '请输入密码',
    },
    {
      validator: (value, cb) => {
        if (value !== loginForm.password) {
          cb('两个密码不匹配')
        } else {
          cb()
        }
      },
    },
  ],
}

// 重置验证码
const resetCaptcha = () => {
  window.clearInterval(captchaTimer.value)
  captchaTime.value = 60
  captchaBtnName.value = '获取验证码'
  captchaDisable.value = false
}

// 弹出行为验证码
const onCaptcha = async () => {
  if (captchaLoading.value) return
  const isInvalid = await loginFormRef.value?.validateField('phone')
  if (isInvalid) return
  // 重置行为参数
  verifyRef.value.instance.refresh()
  verifyRef.value.show()
}

// 获取验证码
const getCaptcha = async (captchaReq: BehaviorCaptchaReq) => {
  try {
    captchaLoading.value = true
    captchaBtnName.value = '发送中...'

    // 这里需要调用接口获取验证码
    await getSmsCaptcha(loginForm.phone, captchaReq)
    captchaLoading.value = false
    captchaDisable.value = true
    captchaBtnName.value = `获取验证码(${(captchaTime.value -= 1)}s)`
    Message.success('短信发送成功')
    captchaTimer.value = window.setInterval(() => {
      captchaTime.value -= 1
      captchaBtnName.value = `获取验证码(${captchaTime.value}s)`
      if (captchaTime.value <= 0) {
        resetCaptcha()
      }
    }, 1000)
  } catch (e) {
    resetCaptcha()
    Message.error(e)
  } finally {
    captchaLoading.value = false
  }
}

// 清空表单
const resetForm = () => {
  Object.assign(loginForm, {
    name: '',
    nickname: '',
    phone: '',
    captcha: '',
    password: '',
    password2: '',
  })
}

// 取消注册账号
const cancelLogin = () => {
  resetForm()
  loginFormRef.value.resetFields()
  loginWindow.value = false
}

// 提交表单注册账号
const handleSubmit = async ({ values, errors }) => {
  try {
    if (errors) {
      return
    }
    loading.value = true
    const data = {
      username: encryptByRsa(values.username),
      nickname: values.nickname,
      phone: encryptByRsa(values.phone),
      password: encryptByRsa(values.password),
    }
    const captchaReq = await getSmsCaptchaStatus(data.phone, values.captcha)
    if (!captchaReq) {
      Message.error('验证码错误')
      return
    }
    const res = await loginIdentity(data)
    cancelLogin()
    if (res.data === 0 || !res.data) {
      Message.error('注册失败')
      return
    }
    Message.success('注册成功')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">

</style>
