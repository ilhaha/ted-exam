<template>
  <a-modal
    v-model:visible="forgotWindow"
    :mask-closable="false"
    :width="700"
    draggable
    :footer="false"
  >
    <template #title>
      忘记密码
    </template>
    <div>
      <a-form
        ref="forgotFormRef"
        :rules="forgotFormRules"
        :model="forgotForm"
        :style="{ width: '600px' }"
        @submit="handleSubmit"
      >
        <a-form-item field="phone" label="手机号" validate-trigger="blur">
          <a-input v-model="forgotForm.phone" :max-length="11" placeholder="请输入手机号" allow-clear />
        </a-form-item>
        <a-form-item field="captcha" label="验证码">
          <a-input v-model="forgotForm.captcha" :max-length="4" placeholder="请输入验证码" allow-clear />
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
        <a-form-item field="password" label="新密码" validate-trigger="blur">
          <a-input-password v-model="forgotForm.password" placeholder="请输入6-10位密码" />
        </a-form-item>
        <a-form-item field="password2" label="确认密码" validate-trigger="blur">
          <a-input-password v-model="forgotForm.password2" placeholder="确认密码" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="loading" html-type="submit">确定</a-button>
            <a-button @click="cancelForgot">取消</a-button>
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
import { type BehaviorCaptchaReq, findIsPhone, forgotPassword, getSmsCaptcha } from '@/apis'
import { encryptByRsa } from '@/utils/encrypt'
import * as Regexp from '@/utils/regexp'
import { forgotFormKey } from '@/utils/inject-keys'

const forgotWindow = inject(forgotFormKey)
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
const forgotFormRef = ref(null)
// 表单数据
const forgotForm = reactive({
  phone: '',
  captcha: '',
  password: '',
  password2: '',
})

// 表单验证规则
const forgotFormRules = {
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
        if (value !== forgotForm.password) {
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
  const isInvalid = await forgotFormRef.value?.validateField('phone')
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

    // 验证手机号是否存在
    const isPhone = await findIsPhone(encryptByRsa(forgotForm.phone))
    if (!isPhone.data) {
      resetCaptcha()
      Message.error('该手机号未绑定账号')
      return
    }
    // 这里需要调用接口获取验证码
    await getSmsCaptcha(forgotForm.phone, captchaReq)
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
  Object.assign(forgotForm, {
    phone: '',
    captcha: '',
    password: '',
    password2: '',
  })
}

// 取消忘记密码
const cancelForgot = () => {
  resetForm()
  forgotFormRef.value.resetFields()
  forgotWindow.value = false
}

// 提交表单忘记密码
const handleSubmit = async ({ values, errors }) => {
  try {
    if (errors) {
      return
    }
    loading.value = true
    const data = {
      phone: encryptByRsa(values.phone),
      password: encryptByRsa(values.password),
    }
    const res = await forgotPassword(data)
    cancelForgot()
    if (!res.data) {
      Message.error('修改失败')
      return
    }
    Message.success('修改成功')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">

</style>
