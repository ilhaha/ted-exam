<template>
  <a-modal
    :visible="visible"
    title="证件复审"
    @cancel="handleCancel"
    :mask-closable="false"
    :footer="false"
    :width="800"
    class="custom-modal"
  >
    <div class="form-actions-container">
      <div class="upload-section">
        <!-- 复审资格申请表上传 -->
        <div class="upload-item">
          <div class="upload-title">复审资格申请表</div>
          <a-upload
            :action="uploadUrl"
            :headers="{
              Authorization: `Bearer ${getToken()}`
            }"
            :data="{ type: 'pic', documentTypeId: selectedType }"
            :limit="1"
            v-model:file-list="applicationFormList"
            :accept="'image/jpeg,image/png,image/jpg'"
            @success="handleApplicationSuccess"
            @before-upload="beforeUpload"
            @error="handleError"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-upload />
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">支持图片格式，大小不超过 20MB</div>
              </div>
            </template>
          </a-upload>
          <div v-if="applicationFormUrl" class="preview-section">
            <img :src="applicationFormUrl" class="preview-image" />
            <a-button type="text" @click="applicationFormUrl = ''">
              <icon-delete />
            </a-button>
          </div>
        </div>

        <!-- 作业资格证上传 -->
        <div class="upload-item">
          <div class="upload-title">作业资格证</div>
          <a-upload
            :action="uploadUrl"
            :headers="{
              Authorization: `Bearer ${getToken()}`
            }"
            :data="{ type: 'pic', documentTypeId: selectedType }"
            :limit="1"
            v-model:file-list="qualificationCertList"
            :accept="'image/jpeg,image/png,image/jpg'"
            @success="handleQualificationSuccess"
            @before-upload="beforeUpload"
            @error="handleError"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-upload />
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">支持图片格式，大小不超过 20MB</div>
              </div>
            </template>
          </a-upload>
          <div v-if="qualificationCertUrl" class="preview-section">
            <img :src="qualificationCertUrl" class="preview-image" />
            <a-button type="text" @click="qualificationCertUrl = ''">
              <icon-delete />
            </a-button>
          </div>
        </div>

        <a-button 
          type="primary" 
          class="confirm-upload-btn" 
          :disabled="!canSubmit"
          @click="confirmUpload"
        >
          确认提交
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDelete } from '@arco-design/web-vue/es/icon'
import { getToken } from '@/utils/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 获取环境变量中的API基础URL
const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file`

// 选中的资料类型
const selectedType = ref<number>()

// 定义上传文件项的类型
interface UploadItem {
  uid: string;
  name: string;
  status?: 'init' | 'uploading' | 'done' | 'error';
  file?: File;
  url?: string;
  response?: {
    data: {
      url: string;
    }
  }
}

// 文件列表
const applicationFormList = ref<UploadItem[]>([])
const qualificationCertList = ref<UploadItem[]>([])

// 上传后的文件URL
const applicationFormUrl = ref('')
const qualificationCertUrl = ref('')

// 是否可以提交
const canSubmit = computed(() => {
  return applicationFormList.value.length > 0 && 
         qualificationCertList.value.length > 0 &&
         applicationFormUrl.value && 
         qualificationCertUrl.value
})

// 处理申请表上传成功
const handleApplicationSuccess = (file: UploadItem) => {
  applicationFormUrl.value = file.response?.data?.url || ''
}

// 处理资格证上传成功
const handleQualificationSuccess = (file: UploadItem) => {
  qualificationCertUrl.value = file.response?.data?.url || ''
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    Message.error('只能上传图片文件！')
    return false
  }
  return true
}

const handleError = (error: any) => {
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (error.file.size > maxSize) {
    Message.error('上传失败,图片文件不能超过20MB!')
  } else {
    Message.error('系统错误')
  }
}

// 确认上传
const confirmUpload = () => {
  if (!canSubmit.value) {
    Message.warning('请上传所有必需的文件')
    return
  }

  // 只返回两张图片的URL
  emit('success', {
    applicationFormUrl: applicationFormUrl.value,
    qualificationCertUrl: qualificationCertUrl.value
  })
  handleCancel()
}

// 关闭时重置
const handleCancel = () => {
  applicationFormList.value = []
  qualificationCertList.value = []
  applicationFormUrl.value = ''
  qualificationCertUrl.value = ''
  emit('update:visible', false)
}
</script>

<style scoped>
.form-actions-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  align-items: center;
}

.upload-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: var(--color-bg-2);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.upload-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.upload-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #165dff;
  border-radius: 1.5px;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 120px;
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
  transition: opacity 0.2s ease;
}

.upload-button:hover {
  border-color: #165dff;
  background-color: #f0f7ff;
}

.upload-button:hover::before {
  opacity: 1;
}

.upload-button :deep(.arco-icon) {
  font-size: 32px;
  color: #165dff;
  margin-bottom: 12px;
  transition: transform 0.2s ease;
}

.upload-button:hover :deep(.arco-icon) {
  transform: scale(1.05);
}

.upload-text {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.upload-hint {
  margin-top: 6px;
  font-size: 13px;
  color: #86909c;
  text-align: center;
  max-width: 90%;
}

.preview-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.preview-section:hover {
  background-color: var(--color-fill-3);
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.confirm-upload-btn {
  width: 100%;
  height: 40px;
  background: #165dff;
  border: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.2);
  margin-top: 16px;
}

.confirm-upload-btn:hover:not(:disabled) {
  background: #0e42d2;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.confirm-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #e5e6eb;
  box-shadow: none;
}
</style> 