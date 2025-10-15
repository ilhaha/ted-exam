<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @error="handleError"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="baseColumns">
      <template #videoPath>
        <a-upload
          :action="'/api/upload/file'"
          :headers="{
            Authorization: `Bearer ${getToken()}`
          }"
          :data="{ type: 'video' }"
          :limit="1"
          accept="video/*"
          list-type="text"
          v-model:file-list="fileList"
          @success="handleSuccess"
          @before-upload="beforeUpload"
          @error="handleError"
        >
          <template #upload-button>
            <a-button>点击上传视频</a-button>
          </template>
        </a-upload>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getVideo, addVideo, updateVideo,customizeaAddVideo,customizeaUpdateVideo } from '@/apis/training/video'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { getToken } from '@/utils/auth'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改视频' : '新增视频'))
const formRef = ref<InstanceType<typeof GiForm>>()
const [form, resetForm] = useResetReactive({
  // todo 待补充
})

// 添加文件列表的响应式变量
const fileList = ref([])

// 修改 columns 定义，将基础字段分离出来
const baseColumns: ColumnItem[] = reactive([
  {
    label: '视频标题',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入视频标题' }]
  },
  {
    label: '排序序号',
    field: 'sort',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入排序序号' }]
  },
  {
    label: '上传视频',
    field: 'videoPath',
    type: 'slot', // 改为插槽类型
    span: 24,
    rules: [{ required: true, message: '请上传视频', trigger: 'change' }]
  }
])

// 处理上传成功
const handleSuccess = (file: any) => {
  form.videoPath = file.response.data.url
  form.duration = file.response.data.duration
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/')
  if (!isVideo) {
    Message.error('只能上传视频文件！')
    return false
  }
  return true
}


const handleError = (error: any) => {
  const maxSize = 2 * 1024 * 1024 * 1024; 
  if (error.file.size > maxSize) {
    Message.error('上传失败，视频文件不能超过2GB！')
  } else {
    Message.error('系统错误')
  }
}

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  fileList.value = [] // 清空文件列表
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      if(fileList.value.length <= 0) {
        Message.error("请上传视频！")
        return false
      }
      await customizeaUpdateVideo(form, dataId.value)
      Message.success('修改成功')
    } else {
       if(fileList.value.length <= 0) {
        Message.error("请上传视频！")
        return false
      }
      await customizeaAddVideo(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async (trainingId:string,chapterId: string) => {
  reset()
  dataId.value = ''
  visible.value = true
  Object.assign(form, { trainingId,chapterId })
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getVideo(id)
  // 构造文件列表格式
  fileList.value = [{
    uid: id,  // 唯一标识
    name: data.title + "视频" || '视频文件',  // 文件名
    url: data.videoPath,  // 文件地址
    status: 'done'  // 上传状态：done 表示已完成
  }]
  
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
