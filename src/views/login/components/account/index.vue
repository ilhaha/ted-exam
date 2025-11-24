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
    <a-form-item field="username" hide-label>
      <a-input v-model="form.username" placeholder="请输入身份证号" allow-clear />
    </a-form-item>
    <a-form-item field="examNumber" hide-label>
      <a-input v-model="form.examNumber" placeholder="请输入准考证号" allow-clear />
    </a-form-item>
    <a-form-item>
      <a-row justify="end" align="center" class="w-full">
        <!-- 监考员链接，点击弹窗 -->
        <a-link @click.prevent="showProctorModal = true">我是监考员</a-link>
      </a-row>
    </a-form-item>
    <a-form-item>
      <a-space direction="vertical" fill class="w-full">
        <a-button class="btn" type="primary" :loading="loading" html-type="submit" size="large" long>进入考试</a-button>
      </a-space>
    </a-form-item>
  </a-form>

<a-modal
  v-model:visible="showProctorModal"
  title="请输入开考密码"
  :mask-closable="false"
  :closable="false"  
  :footer="null"     
>
  <a-input
    v-model="proctorPassword"
    type="password"
    max-length="6"
    placeholder="请输入开考密码"
    @keydown.enter="handleConfirmPassword"
  />
  <div style="margin-top: 16px; text-align: right;">
  <a-space>
    <a-button @click="handleCancel">取消</a-button>
    <a-button @click="handleConfirmPassword" type="primary">确认</a-button>
  </a-space>
</div>
</a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useUserStore, useTabsStore } from '@/stores'
import { useFullscreen } from '@vueuse/core'
import { encryptByRsa } from '@/utils/encrypt'

const formRef = ref()
const form = reactive({
  username: '',
  examNumber: ''
})
const rules = {
  username: [
    { required: true, message: '请输入身份证号' },
  ],
  examNumber: [
    { required: true, message: '请输入准考证号' }]
}

const loading = ref(false)
const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()

// 监考员弹窗控制
const showProctorModal = ref(false)
const proctorPassword = ref('')

// 监考员开考密码确认逻辑
const handleConfirmPassword = async () => {
  const password = proctorPassword.value

  if (!password) {
    Message.error('请输入开考密码')
    return
  }

  const passwordPattern = /^\d{6}$/
  if (!passwordPattern.test(password)) {
    Message.error('密码格式不正确，应为6位数字')
    return
  }

  try {
    await userStore.invigilatortLogin({
      username: encryptByRsa("INVIGILATOR-LOGIN"),
      examPassword: encryptByRsa(password) || '',
      password: encryptByRsa("INVIGILATOR-LOGIN"),
      rememberMe: true
    })
    tabsStore.reset()
    await router.push('/invigilator')
    Message.success('欢迎使用')
    // toggle()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  showProctorModal.value = false;
  proctorPassword.value = ''
}

// 登录提交逻辑
const handleLogin = async () => {

  if ((await formRef.value?.validate())) return

  if(!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(form.username)) {
    Message.error("身份证格式不正确")
    return
  }

  if(!/^\d{14}$/.test(form.examNumber)){
    Message.error("准考证号为是14位数字")
    return
  }  

  try {
    await userStore.accountLogin({
      username: encryptByRsa(form.username) || '',
      examNumber: encryptByRsa(form.examNumber) || '',
      password: encryptByRsa("EXAM-LOGIN"),
      rememberMe: true
    })
    tabsStore.reset()
    await router.push('/candidates')
    Message.success('欢迎使用')
    // toggle()
  } catch (error) {
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.btn {
  height: 40px;
}
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


.btn {
  height: 40px;
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
</style>
