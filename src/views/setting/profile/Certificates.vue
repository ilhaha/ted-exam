<template>
  <div>
    <!-- 右侧证件列表 -->
    <div v-if="getRoleFlag() === '1'" class="cert-section">
      <div class="cert-container">
        <div class="cert-content">
          <div class="certificate-section">
            <div v-if="loading" class="loading-state">
              <a-spin/>
            </div>
            <template v-else-if="certificates && certificates.length > 0">
              <div class="certificate-list">
                <a-card :bordered="false" class="cert-list-card">
                  <template #title>证件列表</template>
                  <div class="cert-list-content">
                    <div v-for="cert in certificates"
                         :key="cert.id"
                         class="cert-item"
                         @click="showCertDetail(cert)"
                    >
                      <div class="cert-thumbnail">
                        <img
                          :src="cert.imageUrl || '/static/images/default-cert.jpg'"
                          :alt="cert.certificateTypeName"
                          class="thumbnail-image"
                        />
                      </div>
                      <div class="cert-details">
                        <h3 class="cert-title">{{ cert.certificateTypeName }}</h3>
                        <div class="cert-info">
                          <div class="info-group">
                            <span class="info-item">
                              <span class="label">证书编号：</span>
                              <span>{{ cert.certificateNumber }}</span>
                            </span>
                            <span class="info-item">
                              <span class="label">生效日期：</span>
                              <span>{{ cert.holdingDate }}</span>
                            </span>
                            <span class="info-item">
                              <span class="label">到期日期：</span>
                              <span>{{ cert.expiryDate }}</span>
                            </span>
                          </div>
                          <div class="cert-status">
                            <a-tag :color="cert.certificateStatus === 1 ? 'green' : 'red'">
                              {{ cert.certificateStatus === 1 ? '有效' : '已过期' }}
                            </a-tag>
                          </div>
                        </div>
                        <!-- 添加证件复审按钮 -->
                        <a-button
                          @click.stop="handleReexamine(cert)"
                          :disabled="!canReexamine(cert)"
                        >
                          证件复审
                        </a-button>
                      </div>
                    </div>
                  </div>
                  <div class="pagination-wrapper">
                    <a-pagination
                      :total="total"
                      :current="currentPage"
                      :page-size="pageSize"
                      @change="handlePageChange"
                    />
                  </div>
                </a-card>
              </div>
            </template>
            <div v-else class="empty-state">
              <a-empty description="暂无证书信息"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加证书详情抽屉 -->
    <a-drawer
      :visible="drawerVisible"
      placement="bottom"
      height="80%"
      @cancel="closeDrawer"
    >
      <template #title>
        <div class="drawer-title">
          <span class="title-text">{{ selectedCert?.certificateTypeName }}</span>
          <a-tag
            :color="selectedCert?.certificateStatus === 1 ? 'green' : 'red'"
            class="status-tag"
          >
            {{ selectedCert?.certificateStatus === 1 ? '有效' : '已过期' }}
          </a-tag>
        </div>
      </template>

      <div class="cert-detail-content" v-if="selectedCert">
        <!-- 证书图片 -->
        <div class="detail-image">
          <img
            :src="selectedCert.imageUrl || '/static/images/default-cert.jpg'"
            :alt="selectedCert.certificateTypeName"
          />
        </div>

        <!-- 证书详细信息 -->
        <div class="cert-info-section">
          <div class="info-item">
            <span class="label">证书编号：</span>
            <span class="value">{{ selectedCert.certificateNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">生效日期：</span>
            <span class="value">{{ selectedCert.holdingDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">到期日期：</span>
            <span class="value">{{ selectedCert.expiryDate || '-' }}</span>
          </div>
          <!-- 可以添加更多证书信息字段 -->
        </div>
      </div>
    </a-drawer>

    <!-- 添加复审弹窗 -->
    <ReexamineModal
      v-model:visible="reexamineVisible"
      @success="handleReexamineSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {useWindowSize} from '@vueuse/core'
import {type FileItem, Message} from '@arco-design/web-vue'
import BasicInfoUpdateModal from './BasicInfoUpdateModal.vue'
import ReexamineModal from './ReexamineModal.vue'
import {uploadAvatar} from '@/apis/system'
import 'vue-cropper/dist/index.css'
import {useUserStore} from '@/stores'
import getAvatar from '@/utils/avatar'
import {ref, computed} from 'vue'
import {getCandidateCertificateList, submitReexamination} from "@/apis/certificates/certificates";
import {studentUploadDocuments} from "@/apis/document";
import { getRoleFlag } from '@/utils/auth'

const {width} = useWindowSize()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const avatar = {
  uid: '-2',
  name: 'avatar.png',
  url: userInfo.value.avatar,
}
const avatarList = ref<FileItem[]>([avatar])
const fileRef = ref(reactive({name: 'avatar.png'}))
const options: cropperOptions = reactive({
  img: '',
  autoCrop: true,
  autoCropWidth: 160,
  autoCropHeight: 160,
  fixedBox: true,
  fixed: true,
  full: false,
  centerBox: true,
  canMove: true,
  outputSize: 1,
  outputType: 'png',
})
const visible = ref(false)


const uploadVisible = ref(false)

const documentUploadRef = ref(null)
const handleUploadSuccess = async (data: { docPath: string, typeId: number }) => {
  const res = await studentUploadDocuments(data)
  if (res.code == 0) {
    Message.success("提交成功")
    documentUploadRef.value?.closeModal()
  }

}

const handleDocUpload = () => {
  uploadVisible.value = true
}

const handleModalClose = () => {
  uploadVisible.value = false
}

const handleEdit = () => {
  visible.value = true
}

// 打开裁剪框
const onBeforeUpload = (file: File): boolean => {
  fileRef.value = file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    options.img = reader.result
  }
  visible.value = true
  return false
}

// 重置
const reset = () => {
  fileRef.value = {name: ''}
  options.img = ''
  visible.value = false
}

const previews: any = ref({})
const previewStyle: any = ref({})
// 实时预览
const handleRealTime = (data: any) => {
  previewStyle.value = {
    width: `${data.w}px`,
    height: `${data.h}px`,
    overflow: 'hidden',
    margin: '0',
    zoom: 100 / data.h,
    borderRadius: '50%',
  }
  previews.value = data
}

const cropperRef = ref()
// 上传头像
const handleUpload = async () => {
  cropperRef.value.getCropBlob((data: any) => {
    const formData = new FormData()
    formData.append('avatarFile', data, fileRef.value?.name)
    uploadAvatar(formData).then((res) => {
      userInfo.value.avatar = res.data.avatar
      avatarList.value[0].url = getAvatar(res.data.avatar, undefined)
      reset()
      Message.success('更新成功')
    })
  })
}

const BasicInfoUpdateModalRef = ref<InstanceType<typeof BasicInfoUpdateModal>>()
// 修改基本信息
const onUpdate = async () => {
  BasicInfoUpdateModalRef.value?.onUpdate()
}

// 证书列表相关状态
const certificates = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 获取证书列表
const fetchCertificateList = async () => {
  loading.value = true
  try {
    // 使用与 ExamPlanList 相同的分页参数格式
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    const response = await getCandidateCertificateList(params)
    console.log('证书列表数据：', response)
    if (response?.data) {
      certificates.value = response.data.list || []// 使用 list 字段
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('获取考试证书数据失败：', error)
    Message.error('获取证书列表失败')
    certificates.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchCertificateList()
}

onMounted(() => {
  fetchCertificateList()
})

const getCertStatusColor = (status: string) => {
  const colorMap = {
    1: 'green',
    2: 'red',
  }
  return colorMap[status] || 'blue'
}

const getCertStatusText = (status: string) => {
  const textMap = {
    1: '有效',
    2: '已过期',
  }
  return textMap[status] || '未知'
}

const drawerVisible = ref(false)
const selectedCert = ref(null)

// 显示证书详情
const showCertDetail = (cert) => {
  selectedCert.value = cert
  drawerVisible.value = true
}

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false
  selectedCert.value = null
}

// 处理删除
const handleDelete = (record: any) => {
  // 这里添加删除逻辑
  console.log('删除证书:', record)
}

// 获取证件详情数据
const getCertificateDetails = computed(() => {
  if (!selectedCert.value) return []

  return [
    {
      label: '证件名称',
      value: selectedCert.value.name
    },
    {
      label: '证件号码',
      value: selectedCert.value.number
    },
    {
      label: '发证机构',
      value: selectedCert.value.issuer || '未填写'
    },
    {
      label: '发证日期',
      value: selectedCert.value.issueDate || '未填写'
    },
    {
      label: '有效期至',
      value: selectedCert.value.validUntil
    },
    {
      label: '证件状态',
      value: getCertStatusText(selectedCert.value.status)
    },
    {
      label: '备注信息',
      value: selectedCert.value.remarks || '无'
    }
  ]
})

// 添加报名处理函数
const handleRenew = (record: any) => {
  // 这里添加报名逻辑
  console.log('报名续证:', record)
  // 可以添加弹窗确认或直接跳转到报名页面
  Message.success('即将跳转到报名页面')
}

// 添加复审弹窗状态
const reexamineVisible = ref(false)
const selectedCertForReexamine = ref(null)//传回的证书对象

// 处理证件复审
const handleReexamine = (cert) => {
  // 检查是否在截止日期前一个月内
  const expiryDate = new Date(cert.expiryDate)
  const now = new Date()
  const oneMonthBefore = new Date(expiryDate)
  oneMonthBefore.setMonth(expiryDate.getMonth() - 1)

  if (now < oneMonthBefore) {
    Message.warning('证件复审只能在截止日期前一个月内进行')
    return
  }

  selectedCertForReexamine.value = cert
  reexamineVisible.value = true
}

// 处理复审成功
const handleReexamineSuccess = async (data) => {
  try {
    // 调用后端API提交复审申请
    const response = await submitReexamination({
      certificateId: selectedCertForReexamine.value.certificateTypeId,
      applicationFormUrl: data.applicationFormUrl,
      qualificationCertUrl: data.qualificationCertUrl
    })

    // 检查返回的数据结构
    if (response.data.code === 200) {
      Message.success('复审申请已提交成功')
      reexamineVisible.value = false
      // 刷新证书列表
      await fetchCertificateList()
    } else {
      // 处理错误情况
      Message.error(response.data.msg || '提交复审申请失败')
    }
  } catch (error) {
    console.error('提交复审申请失败:', error)
    Message.error('提交复审申请失败，请稍后重试')
  }
}

// 判断是否可以复审
const canReexamine = (cert) => {
  if (!cert.expiryDate) return false

  const expiryDate = new Date(cert.expiryDate)
  const now = new Date()
  const oneMonthBefore = new Date(expiryDate)
  oneMonthBefore.setMonth(expiryDate.getMonth() - 1)

  return now >= oneMonthBefore && now <= expiryDate
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  gap: 24px;
  padding-top: 10px;
  box-sizing: border-box;
}

.info-section {
  flex: 0.35;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  min-width: 400px;
  height: 650px;
}

.cert-section {
  flex: 0.65;
  margin-top: 16px;

  .cert-container {
    background-color: var(--color-bg-2);
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--color-border);
    height: fit-content;
  }
}

.user-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  font-weight: bold;
  color: #fff;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
}

.gender-icon {
  margin-left: 10px;
}

.user-dept {
  font-size: 14px;
  color: var(--color-text-3);
}

.more-btn {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--color-text-3);
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    color: var(--color-text-1);
    background-color: var(--color-fill-2);
  }
}

.edit-btn {
  display: none;
}

.info-list {
  .info-item {
    display: flex;
    margin-bottom: 16px;

    .label {
      width: 100px;
      color: var(--color-text-3);
    }

    .value {
      flex: 1;
      color: var(--color-text-1);
    }
  }
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.cert-content {
  .certificate-section {
    margin-top: 16px;
  }

  .certificate-list {
    .cert-list-card {
      background-color: var(--color-bg-1);

      :deep(.arco-card-header) {
        background-color: var(--color-bg-1);
      }
    }

    .cert-list-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cert-item {
      background-color: var(--color-bg-1);
      padding: 16px;
      border-radius: 4px;
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      transition: all 0.3s;
      border: 1px solid var(--color-border-2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
    }

    .cert-thumbnail {
      flex-shrink: 0;
      width: 80px;
      height: 60px;
      overflow: hidden;
      border-radius: 4px;
      background-color: var(--color-fill-2);

      .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .cert-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .cert-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--color-text-1);
      margin: 0 0 4px 0;
    }

    .cert-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-group {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .info-item {
      font-size: 14px;
      white-space: nowrap;

      .label {
        color: var(--color-text-3);
        margin-right: 4px;
      }
    }

    .cert-status {
      margin-left: 20px;

      .status-tag {
        font-size: 15px;
        padding: 0 12px;
        height: 28px;
        line-height: 28px;

        :deep(.arco-tag-content) {
          font-weight: 500;
        }
      }
    }
  }

  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;

  .title-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .status-tag {
    font-size: 14px;
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
  }
}

.cert-detail-content {
  padding: 20px 0;

  .detail-image {
    width: 100%;
    height: 240px;
    overflow: hidden;
    border-radius: 4px;
    background-color: var(--color-fill-2);
    margin-bottom: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .cert-info-section {
    .info-item {
      margin-bottom: 16px;
      font-size: 15px;

      .label {
        color: var(--color-text-3);
        margin-right: 8px;
        min-width: 80px;
        display: inline-block;
      }

      .value {
        color: var(--color-text-1);
      }
    }
  }
}

.cert-item {
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
