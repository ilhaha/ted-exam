<template>
  <div class="special-certification-applicant" >
    <a-modal
        :visible="visible"
        :title="title"
        @cancel="handleCancel"
        :mask-closable="false"
        :footer="false"
        :width="500"
        class="custom-modal"
    >
      <div class="form-actions-container">
        <div class="upload-section" >
          <a-select
              v-model="selectedType"
              placeholder="请选择资料类型"
              class="type-select"
              :options="typeNameList"
              :field-names="{ label: 'label', value: 'value' }"
              allow-clear
              @change="handleTypeChange"
          />
          <!-- 上传组件 -->
          <a-upload
              :action="uploadUrl"
              :headers="{
              Authorization: `Bearer ${getToken()}`
            }"
              :data="uploadData"
              :multiple="true"
              :limit="5"
              v-model:file-list="fileList"
              :accept="'image/jpeg,image/png,image/jpg'"
              @success="handleSuccess"
              @before-upload="beforeUpload"
              @error="handleError"
              :disabled="!selectedType"
              @click="handleUploadClick"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-upload />
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">支持多个图片文件，单个大小不超过 20MB</div>
              </div>
            </template>
          </a-upload>

          <a-button
              type="primary"
              class="confirm-upload-btn"
              :disabled="!fileList.length"
              @click="confirmUpload"
          >
            确认上传
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getToken } from '@/utils/auth'
import { type DocumentTypeNameVO, getTypeNameList } from '@/apis/document/index'

console.log(222,import.meta.env.VITE_API_PREFIX);

// 获取环境变量中的API基础URL
const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file`
// 上传之后的图片url
const imageUrl = ref('')
const uploadData = ref({
  type: 'pic'
})

// 定义上传文件项的类型
interface UploadItem {
  uid: string;
  name: string;
  status?: 'init' | 'uploading' | 'done' | 'error';
  file?: File;
  url?: string;
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'upload-success'])

// 文件列表
const fileList = ref<UploadItem[]>([])

// 选中的资料类型
const selectedType = ref<number>()

// 资料类型列表
const typeNameList = ref<DocumentTypeNameVO[]>([])

// 获取资料类型列表
const getDocumentTypeList = async () => {
  try {
    const res = await getTypeNameList()
    typeNameList.value = res.data.map(item => ({
      ...item,
      disabled: item.disabled || false
    }))
  } catch (error) {
    Message.error('获取资料类型列表失败')
  }
}

// 处理资料类型选择变化
const handleTypeChange = (value: string) => {
  const selectedOption = typeNameList.value.find(item => item.value === value)
  if (selectedOption?.label === '视频') {
    uploadData.value.type = 'video'
  } else {
    uploadData.value.type = 'pic'
  }
  fileList.value = []
}

// 确认上传
// 在 script 部分添加 handleSuccess 处理函数
const handleSuccess = (file: any) => {
  if(file.response.code != 0) {
    Message.error(file.response.msg)
    return
  }
}

const closeModal = () => {
  emit('close')
}

// 修改确认上传的逻辑
const confirmUpload = () => {
  if (!selectedType.value) {
    Message.warning('请选择资料类型')
    return
  }

  if (fileList.value.length === 0) {
    Message.warning('请先选择要上传的文件')
    return
  }

  const urls = fileList.value.map(item => item.response.data.url)
  // 发送所有文件的URL
  emit('upload-success', {
    docPath: urls.join(','),
    typeId: selectedType.value
  })
  handleCancel()
  // emit('close')
}

// 修改关闭时重置的逻辑
// 删除重复的closeModal函数
const handleCancel = () => {
  // 重置所有表单内容
  selectedType.value = undefined
  fileList.value = []
  uploadData.value = {
    type: 'pic',
  }
  emit('close')// 添加这行触发关闭事件
}

onMounted(() => {
  getDocumentTypeList()
})

// 处理上传点击事件
const handleUploadClick = (e: Event) => {
  if (!selectedType.value) {
    Message.warning('请先选择资料类型')
    e.preventDefault()
  }
}
</script>

<style scoped>
.form-actions-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
}

.download-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);
}

.download-btn:hover {
  background: linear-gradient(135deg, #0e42d2, #0a2b8f);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.3);
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  align-items: center;
}

/* 确保上传组件和按钮宽度一致 */
.upload-section :deep(.arco-upload) {
  width: 100%;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.upload-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(22, 93, 255, 0.05) 0%, rgba(22, 93, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-button:hover {
  border-color: #165dff;
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.upload-button:hover::before {
  opacity: 1;
}

.upload-button :deep(.arco-icon) {
  font-size: 32px;
  color: #165dff;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.upload-button:hover :deep(.arco-icon) {
  transform: scale(1.1);
}

.upload-text {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.upload-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #86909c;
  text-align: center;
  max-width: 90%;
}

.confirm-upload-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #00b42a, #009a29);
  border: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 180, 42, 0.2);
  box-sizing: border-box;
  margin-top: 5px;
}

.confirm-upload-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #009a29, #007a21);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 180, 42, 0.3);
}

.confirm-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #e5e6eb;
  box-shadow: none;
}

/* 自定义模态框样式 */
:deep(.arco-modal) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.arco-modal-header) {
  background: linear-gradient(135deg, #165dff, #0e42d2);
  color: white;
  padding: 16px 20px;
  border-bottom: none;
}

:deep(.arco-modal-title) {
  font-weight: 600;
  font-size: 18px;
}

:deep(.arco-modal-close-btn) {
  color: white;
}

:deep(.arco-modal-close-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.arco-modal-body) {
  padding: 0;
}

.type-select {
  width: 100%;
  margin-bottom: 16px;

  :deep(.arco-select-view) {
    height: 40px;
    border-radius: 6px;
    border: 1px solid var(--color-border-2);
    transition: all 0.3s;

    &:hover {
      border-color: var(--color-primary-light-3);
    }

    &:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light-2);
    }
  }
}
/* 身份证上传组件间距 */
.upload-section :deep(.arco-upload) + .arco-upload {
  margin-top: 16px;
}
</style>