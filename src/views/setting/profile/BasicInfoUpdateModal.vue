<template>
  <a-modal
    v-model:visible="visible"
    title="修改基本信息"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 500 ? 500 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { ref } from 'vue' // 新增头像上传接口引入
import { updateUserBaseInfo } from '@/apis/system'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useUserStore } from '@/stores'
import { useResetReactive } from '@/hooks'
import { getToken } from '@/utils/auth'

const { width } = useWindowSize()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const visible = ref(false)
const formRef = ref<InstanceType<typeof GiForm>>()

// 新增头像相关变量
const avatarFileList = ref([])
const uploadAction = `${import.meta.env.VITE_API_PREFIX}/system/user/avatar` // 替换为实际上传接口地址
const uploadData = ref({
  type: 'pic',
})
// 初始化form时增加avatar字段
const [form, resetForm] = useResetReactive({
  nickname: userInfo.value.nickname,
  gender: userInfo.value.gender,
  avatar: userInfo.value.avatar, // 新增头像初始值
})

// 调整columns顺序，头像在昵称上方
const columns: ColumnItem[] = reactive([
  {
    label: '昵称',
    field: 'nickname',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入昵称' }],
  },
  {
    label: '性别',
    field: 'gender',
    type: 'radio-group',
    span: 24,
    props: {
      options: [
        { label: '男', value: 1 },
        { label: '女', value: 2 },
        { label: '未知', value: 0, disabled: true },
      ],
    },
    rules: [{ required: true, message: '请选择性别' }],
  },
])

// 新增头像上传前置校验
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    Message.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    Message.error('图片大小不能超过2MB')
    return false
  }
  return true
}

// 新增头像上传成功处理
const handleAvatarSuccess = async (response: any) => {
  if (response.code === 200) {
    form.avatar = response.data.avatar // 假设接口返回头像URL
    Message.success('头像上传成功')
  } else {
    Message.error('头像上传失败')
    avatarFileList.value = []
  }
}

// 重置时清空头像状态
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  avatarFileList.value = [] // 重置文件列表
}

// 保存
const save = async () => {
  const isInvalid = await formRef.value?.formRef?.validate()
  if (isInvalid) return false
  try {
    await updateUserBaseInfo(form)
    Message.success('修改成功')
    // 修改成功后，重新获取用户信息
    await userStore.getInfo()
    return true
  } catch (error) {
    return false
  }
}

// 修改
const onUpdate = async () => {
  reset()
  visible.value = true
}

defineExpose({ onUpdate })
</script>
