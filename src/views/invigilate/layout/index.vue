<template>
  <a-layout class="layout-container">
    <div class="menu-demo">
      <!-- 添加公告栏 -->
      <div class="notice-bar">
        <a-carousel
          class="notice-carousel"
          animation-name="fade"
          :auto-play="true"
          :show-arrow="false"
          indicator-position="never"
          :interval="3000"
        >
          <a-carousel-item v-for="(notice, index) in announcements" :key="index">
            <div class="notice-item" @click="goAnnouncements(notice.uri)">
              <IconNotification class="notice-icon" />
              <span class="notice-text">{{ notice.title }}</span>
            </div>
          </a-carousel-item>
        </a-carousel>
      </div>

      <a-layout-header class="header">
        <a-menu v-model:selected-keys="selectedKeys" mode="horizontal">
          <a-menu-item key="exam-plan">
            <template #icon><IconCalendar /></template>
            考试计划
          </a-menu-item>
        </a-menu>
      </a-layout-header>

      <div class="content-layout">
        <div class="tab-content">
          <PlanInvigilateList
            v-if="selectedKeys[0] === 'exam-plan'"
            :exams="examPlanList"
            @select="showExamDetail"
          />
        </div>

        <!-- 详情抽屉 -->
        <a-drawer
          :visible="visible"
          :width="640"
          @cancel="onClose"
          @ok="onClose"
          :footer="true"
        >
          <div v-if="selectedItem" class="detail-content">
            <div class="detail-image">
              <img
                :src="selectedItem?.imageUrl || '/static/images/test.jpg'"
                :alt="selectedItem?.projectName"
              />
            </div>
            <a-descriptions
              :data="getDescriptionData()"
              layout="inline-vertical"
            />
            <a-divider />
            <!-- 添加获取开考密码按钮，只在未监考状态显示 -->
            <div v-if="selectedItem?.invigilateStatus === 0" class="exam-actions">
              <a-button
                type="primary"
                :loading="loadingPassword"
                @click="handleGetExamPassword"
              >
                获取开考密码
              </a-button>
            </div>
            <!-- 添加批量录入按钮 -->
            <div v-if="showBatchButton" class="batch-upload">
              <a-button
                type="primary"
                @click="handleBatchInput"
              >
                批量录入考生成绩
              </a-button>
            </div>
            <!-- 添加审核记录按钮 -->
            <div v-if="showAuditButton" class="audit-records">
              <a-button
                type="outline"
                style="margin-top: 16px"
                @click="handleShowAuditRecords"
              >
                <template #icon><icon-file /></template>
                审核记录
              </a-button>
            </div>
          </div>
        </a-drawer>
      </div>
      <a-modal
        title="批量录入考生成绩"
        :visible="showBatchModal"
        :width="800"
        :footer="null"
        @cancel="handleCloseModal"
      >
        <div class="modal-content">
          <a-table
            :data="studentScores"
            :columns="columns"
            :pagination="false"
          >
            <template #empty>
              <div class="empty-table">
                <icon-exclamation-circle class="empty-icon" />
                暂无考生数据，请点击上方按钮添加
              </div>
            </template>
            <template #status="{ record }">
              <a-tag :color="getStatusColor(record.reviewStatus)">
                {{ getStatusText(record.reviewStatus) }}
              </a-tag>
            </template>
            <template #score="{ record }">
              <a-input-number
                v-model="record.score"
                :min="0"
                :max="100"
                :precision="1"
                placeholder="请输入成绩"
              />
            </template>

            <template #answerSheet="{ record }">
              <a-upload
                :custom-request="e => handleUpload(e, record)"
                :show-file-list="false"
              >
                <template #upload-button>
                  <a-button v-if="!record.answerSheetUrl">
                    <template #icon><icon-upload /></template>
                    上传试卷
                  </a-button>
                  <img
                    v-else
                    :src="record.answerSheetUrl"
                    class="preview-image"
                    alt="试卷预览"
                  />
                </template>
              </a-upload>
            </template>
            <!-- 新增操作列 -->
            <template #operations="{ record, rowIndex }">
              <a-space>
                <!-- 更新按钮 -->
                <a-button
                    v-if="showUpdateButton(record)"
                    type="text"
                    status="warning"
                    @click="handleUpdate(record)"
                >
                  <template #icon><icon-edit /></template>
                  更新
                </a-button>

                <!-- 删除按钮 -->
                <a-button
                    type="text"
                    status="danger"
                    :disabled="!canDelete(record)"
                    @click="handleDeleteRow(record, rowIndex)"
                >
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </a-space>
            </template>
            <template #studentId="{ record }">
              <a-input v-model="record.studentId" />
            </template>

            <template #studentName="{ record }">
              <a-input v-model="record.studentName" />
            </template>
          </a-table>

          <div class="modal-footer">
            <a-button @click="handleCloseModal">取消</a-button>
            <a-button
              type="primary"
              :loading="submitting"
              style="margin-left: 12px"
              @click="handleSubmitScores"
            >
              提交成绩
            </a-button>
          </div>
        </div>
      </a-modal>
      <!-- 审核记录模态框部分修改 -->
      <a-modal
        title="审核情况"
        :visible="showAuditModal"
        :width="1000"
        :footer="null"
        @cancel="handleCloseAuditModal"
      >
        <div class="audit-modal-content">
          <a-table
            :data="auditRecords"
            :columns="auditColumns"
            :pagination="false"
          >
            <template #answerSheetUrl="{ record }">
              <img
                :src="record.answerSheetUrl"
                class="preview-image"
                alt="试卷预览"
              />
            </template>

            <!-- 修改状态列 -->
            <template #status="{ record }">
              <a-tag :color="getStatusColor(record)">
                {{ getStatusText(record.reviewStatus) }}
              </a-tag>
            </template>

            <template #selection="{ record }">
              <a-checkbox
                v-model="selectedCandidates"
                :value="record.candidateId"
                :disabled="record.reviewStatus !== 0"
              />
            </template>

            <!-- 修改操作列参数 -->
            <template #operations="{ record }">
              <a-space>
<!--                <a-button-->
<!--                  type="text"-->
<!--                  status="success"-->
<!--                  :disabled="isProcessed(record)"-->
<!--                  @click="handleApprove(record)"-->
<!--                >-->
<!--                  通过-->
<!--                </a-button>-->
<!--                <a-button-->
<!--                  type="text"-->
<!--                  status="danger"-->
<!--                  :disabled="isProcessed(record)"-->
<!--                  @click="handleReject(record)"-->
<!--                >-->
<!--                  拒绝-->
<!--                </a-button>-->
              </a-space>
            </template>
          </a-table>
          <div class="batch-actions" style="    margin-top: 20px;">
<!--            <a-space>-->
<!--              <a-button-->
<!--                type="primary"-->
<!--                :disabled="selectedCandidates.length === 0"-->
<!--                @click="handleBatchApprove"-->
<!--              >-->
<!--                批量通过-->
<!--              </a-button>-->
<!--              <a-button-->
<!--                type="primary"-->
<!--                status="danger"-->
<!--                :disabled="selectedCandidates.length === 0"-->
<!--                @click="handleBatchReject"-->
<!--              >-->
<!--                批量拒绝-->
<!--              </a-button>-->
<!--              <span class="selected-count">已选 {{ selectedCandidates.length }} 项</span>-->
<!--            </a-space>-->
          </div>
        </div>
      </a-modal>
    </div>
  </a-layout>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { ref } from 'vue'
import PlanInvigilateList from '@/components/PlanInvigilateList.vue'
import { listTraining } from '@/apis/training/training'
import type { EnrollResp } from '@/apis/plan/examPlan'
import { getProjectList } from '@/apis/project/project'
import { listAnnouncementHome } from '@/apis/common/announcement'
import {
  type InvigilateExamDetailResp,
  getInvigilateDetail,
  getNeedReviewRecords,
  queryAlreadyCommitOrReject,
  submitExamScores,
  submitReviewResult, updateScoreRecord, deleteScoreRecord,
  getExamPassword,
} from '@/apis/invigilate/planInvigilate'
import { upload } from '@/apis/File/upload'
import { type BehaviorCaptchaReq, getSmsCaptcha } from '@/apis'
import * as Regexp from "@/utils/regexp";

const selectedKeys = ref(['exam-plan'])
const visible = ref(false)
const selectedItem = ref(null)
const selectedType = ref('certificate')
const planId = ref(null)
const showBatchModal = ref(false)
const showBatchButton = ref(false)
const showAuditModal = ref(false)
const showAuditButton = ref(false)
const auditRecords = ref<any[]>([])
const selectedCandidates = ref<number[]>([])
const loadingPassword = ref(false)

const columns = [
  {
    title: '考生ID',
    dataIndex: 'studentId',
    slotName: 'studentId',
  },
  {
    title: '考生姓名',
    dataIndex: 'nickname',
    slotName: 'nickname',
  },
  {
    title: '考试成绩',
    slotName: 'score',
  },
  {
    title: '考试试卷',
    slotName: 'answerSheet',
  },
  {
    title: '审核状态',
    slotName: 'status',
    width: 100,
  },
  {
    title: '操作',
    slotName: 'operations',
    width: 180,
  },
]

// 统一处理审核请求
const handleReview = async (status: number) => {
  if (!selectedCandidates.value.length) {
    Message.warning('请至少选择一条记录')
    return
  }

  try {
    // 构造符合后端要求的参数格式
    const payload = selectedCandidates.value.map((candidateId) => ({
      candidateId,
      newStatus: status,
    }))

    await submitReviewResult(
      Number(planId.value),
      payload, // 传入构造好的参数数组
    )

    Message.success(`已成功处理 ${selectedCandidates.value.length} 条记录`)
    selectedCandidates.value = []
    await refreshRecords()
  } catch (error) {
    Message.error('操作失败')
  }
}

// 批量处理方法
const handleBatchApprove = () => handleReview(1)
const handleBatchReject = () => handleReview(2)

// 统一状态文本映射
const getStatusText = (status: number) => {
  const statusMap = ['待审核', '审核通过', '审核不通过'];
  return statusMap[status] || '未知状态';
};

// 统一状态颜色映射
const getStatusColor = (status: number) => {
  const colorMap = ['orange', 'green', 'red'];
  return colorMap[status] || 'gray';
};

const isProcessed = (record) => {
  return record.reviewStatus !== 0 // 0 表示待审核状态
}

// 调整表格列定义
const auditColumns = [
  // {
  //   title: '选择',
  //   slotName: 'selection',
  //   width: 80,
  // },
  {
    title: '考生ID',
    dataIndex: 'candidateId',
  },
  {
    title: '考生姓名',
    dataIndex: 'nickname',
  },
  {
    title: '试卷图片',
    dataIndex: 'answerSheetUrl',
    slotName: 'answerSheetUrl',
  },
  {
    title: '考试成绩',
    dataIndex: 'examScores',
  },
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    slotName: 'status',
  },
  // {
  //   title: '操作',
  //   slotName: 'operations',
  //   width: 120,
  // },
]
// 获取审核记录
const handleShowAuditRecords = async () => {
  try {
    const data = await fetchAuditRecords(planId.value)
    auditRecords.value = data
    showAuditModal.value = true
  } catch (error) {
    Message.error('获取审核记录失败')
  }
}

// 单个操作处理方法
const handleApprove = (record) => {
  selectedCandidates.value = [record.candidateId]
  handleReview(1)
}

const handleReject = (record) => {
  selectedCandidates.value = [record.candidateId]
  handleReview(2)
}

// 新增记录刷新方法
const refreshRecords = async () => {
  const data = await fetchAuditRecords(planId.value)
  auditRecords.value = data
}

/**
 * 查询待审核的记录
 * @param examId
 */
const fetchAuditRecords = async (examId: string) => {
  try {
    const response = await getNeedReviewRecords(Number(examId))
    return response.data
  } catch (error) {
    Message.error('获取审核记录失败')
    return []
  }
}

const handleCloseAuditModal = () => {
  showAuditModal.value = false
}
const onClose = () => {
  visible.value = false
  selectedItem.value = null
  showBatchTable.value = false
  studentScores.value = []
}

const examPlanList = ref<EnrollResp[]>([])
const projectList = ref([])
const fetchProjectList = async () => {
  try {
    const response = await getProjectList()
    // 通常后端返回的数据会包含在 response.data 中
    projectList.value = response.data
  } catch (error) {
    console.error('获取考试证书数据失败：', error)
  }
}

const showExamDetail = (exam: any, currentStatus: any) => {
  planId.value = exam.examPlanId
  visible.value = true
  selectedType.value = 'exam'
  selectedItem.value = null // 清空之前的数据
  showBatchButton.value = currentStatus == 1
  showAuditButton.value = currentStatus == 2
  // 获取详细信息
  fetchExamDetail(exam.examPlanId)
}

const getExamDesc = (exam: InvigilateExamDetailResp) => {
  return [
    { label: '考试名称', value: exam.examPlanName },
    { label: '考试开始时间', value: exam.startTime },
    { label: '考试结束时间', value: exam.endTime },
    { label: '考试地点', value: exam.locationName },
    { label: '考试时长(分钟)', value: exam.examDuration },
    { label: '考试备注', value: exam.redeme },
  ]
}

const getDescriptionData = () => {
  if (selectedType.value === 'exam') {
    return getExamDesc(selectedItem.value)
  }
}
// 获取公告
const courseList = ref([])
const fetchCourseList = async () => {
  try {
    const response = await listTraining({
      page: 1, // 当前页
      size: 10, // 每页大小
    })
    // 通常后端返回的数据会包含在 response.data 中
    courseList.value = response.data.list
  } catch (error) {
    console.error('获取考试证书数据失败：', error)
  }
}
onMounted(() => {
  fetchProjectList()
  // fetchCourseList()
  fetchAnnouncement()
})

const showCourseDetail = (course) => {
  selectedType.value = 'course'
  selectedItem.value = course
  visible.value = true
}

// 公告数据
const announcements = ref([])

// 获取最新的五条公告标题
async function fetchAnnouncement() {
  try {
    const announcementResp = await listAnnouncementHome()
    const { data } = announcementResp
    // 用获取到的数据更新 poems
    announcements.value = data
  } catch (error) {
    console.error('获取公告失败：', error)
  }
}

// 获取路由实例
const router = useRouter()

const goAnnouncements = (uri) => {
  router.push(`/carousel/${uri}`)
}

// 获取监考计划详情
const fetchExamDetail = async (examPlanId: string) => {
  try {
    const response = await getInvigilateDetail(`examId=${examPlanId}`)
    selectedItem.value = {
      ...response.data,
    }
  } catch (error) {
    console.error('获取考试计划详情失败：', error)
    Message.error('获取考试计划详情失败')
    onClose()
  }
}

const showBatchTable = ref(false)
const studentScores = ref<any[]>([])
const submitting = ref(false)

const handleBatchInput = async () => {
  try {
    const { data } = await queryAlreadyCommitOrReject(Number(planId.value));

    studentScores.value = data.map((item) => ({
      isExisting: true,
      studentId: item.candidateId,
      studentName: item.studentName || `考生${item.candidateId}`,
      score: item.examScores ?? null,
      answerSheetUrl: item.answerSheetUrl || '',
      reviewStatus: item.reviewStatus, // 保留审核状态
      nickname: item.nickname,
    }))

    showBatchModal.value = true;
  } catch (error) {
    Message.error('获取考生列表失败');
  }
};

const handleCloseModal = () => {
  showBatchModal.value = false
  studentScores.value = []
}

const handleUpload = async (e: any, record: any) => {
  try {
    const formData = new FormData()
    formData.append('file', e.fileItem.file)
    formData.append('type', 'pic')
    const res = await upload(formData)
    record.answerSheetUrl = res.data.url
    Message.success('上传成功')
  } catch (error) {
    Message.error('上传失败')
  }
}

const handleSubmitScores = async () => {
  try {
    submitting.value = true

    // 过滤出新增数据
    const newScores = studentScores.value.filter((item) => !item.isExisting)

    // 构造符合后端要求的payload
    const payload = {
      examPlanId: planId.value,
      scores: newScores.map((item) => ({
        studentId: item.studentId, // 注意字段映射
        score: item.score,
        answerSheetUrl: item.answerSheetUrl,
        reviewStatus: item.reviewStatus, // 携带原始审核状态
      })),
    }

    await submitExamScores(payload)
    Message.success('提交成功')
    handleCloseModal()
  } catch (error) {
    Message.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleAddRow = () => {
  studentScores.value.push({
    studentId: '',
    studentName: '',
    score: null,
    answerSheetUrl: '',
    isExisting: false,
    reviewStatus: 0, // 默认状态为待审核
  })
}

// 删除行处理方法
const handleDeleteRow = async (record, rowIndex) => {
  // 处理已存在记录
  if (record.isExisting) {
    try {
      await deleteScoreRecord(planId.value, record.studentId)
      studentScores.value.splice(rowIndex, 1)
      Message.success('删除成功')
    } catch (error) {
      Message.error('删除失败')
    }
  }
  // 处理新增记录
  else {
    studentScores.value.splice(rowIndex, 1)
  }
}

// 显示更新按钮条件：已存在记录且状态为待审核/已拒绝
const showUpdateButton = (record) => {
  return record.isExisting && (record.reviewStatus === 0 || record.reviewStatus === 2)
}

// 允许删除条件：新增记录 或 已存在记录且状态为待审核/已拒绝
const canDelete = (record) => {
  return !record.isExisting ||
      (record.isExisting && (record.reviewStatus === 0 || record.reviewStatus === 2))
}

const handleUpdate = async (record) => {
  try {
    const payload = {
      planId: planId.value,
      candidateId: record.studentId,
      examScores: record.score,
      answerSheetUrl: record.answerSheetUrl,
    }

    await updateScoreRecord(payload)
    Message.success('更新成功')

    // 刷新本地数据
    const { data } = await queryAlreadyCommitOrReject(Number(planId.value))
    studentScores.value = data.map(item => ({
      ...item,
      isExisting: true,
      studentId: item.candidateId,
      reviewStatus: item.reviewStatus,
      score: item.examScores, // 新增此行
    }))
  } catch (error) {
    Message.error('更新失败')
  }
}

// 获取开考密码
const handleGetExamPassword = async () => {
  try {
    loadingPassword.value = true
    const response = await getExamPassword(Number(planId.value))
    if (response.data) {
      Message.success(`${response.data}`)
    }
  } catch (error) {
    Message.error('获取开考密码失败')
  } finally {
    loadingPassword.value = false
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  background: var(--color-bg-1);
  border-radius: 4px;
  overflow: hidden;
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
}

.menu-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 添加公告栏样式
.notice-bar {
  margin: 0 0px 0px 0px;
  padding: 8px 16px 0px 16px;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.notice-carousel {
  height: 32px;
}

.notice-item {
  display: flex;
  align-items: center;
  height: 32px;

  .notice-icon {
    color: rgb(var(--primary-6));
    margin-right: 8px;
    font-size: 16px;
  }

  .notice-text {
    color: var(--color-text-2);
    font-size: 14px;
  }
}

.header {
  background: var(--color-bg-2);
  border-radius: 4px;
  margin: 0 16px 16px 0px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.content-layout {
  flex: 1;
  background: var(--color-bg-1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-content {
  padding: 20px 0;
}

.cert-description {
  h4 {
    margin-bottom: 12px;
    color: var(--color-text-1);
  }

  p {
    color: var(--color-text-2);
    line-height: 1.6;
  }
}

.exam-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
}

.certificate-card {
  margin: 16px 0;

  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--color-text-1);
  }

  .info-card {
    background-color: var(--color-fill-2);
    border-radius: 8px;
    border: 1px solid var(--color-border-2);

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }

  .certificate-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .cert-item {
      padding: 12px;
      background-color: var(--color-bg-2);
      border-radius: 4px;

      .cert-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 8px;
      }

      .cert-number {
        font-size: 13px;
        color: var(--color-text-3);
      }
    }
  }

  .empty-certs {
    padding: 16px 0;
    display: flex;
    justify-content: center;
  }
}
.document-card,
.location-card {
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }

  .info-card {
    background-color: var(--color-fill-2);

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }
}

.document-tags,
.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .doc-tag,
  .location-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;

    :deep(.arco-icon) {
      font-size: 14px;
    }
  }
}

.empty-docs,
.empty-location {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.loading-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.detail-image {
  width: 100%;
  height: 240px;  // 设置固定高度
  overflow: hidden;
  border-radius: 4px;
  background-color: var(--color-fill-2);
  margin-bottom: 16px;  // 添加底部间距

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;  // 保持图片比例
    background-color: var(--color-fill-2);  // 背景色
  }
}

.batch-upload {
  margin-top: 24px;
}
.modal-content {
  padding: 16px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--color-border-2);
}

.preview-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}
/* 新增样式 */
.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.empty-table {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-3);

  .empty-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: var(--color-text-4);
  }
}

/* 调整操作列按钮间距 */
:deep(.arco-table-operation) {
  .arco-btn {
    margin-left: 8px;
  }
}
/* 新增样式 */
.audit-records {
  margin-top: 24px;
  border-top: 1px solid var(--color-border-2);
  padding-top: 16px;
}

.audit-modal-content {
  padding: 16px 0;
}

:deep(.arco-tag) {
  margin: 0;
}

.preview-thumbnail {
  :deep(.arco-image-img) {
    border-radius: 4px;
    object-fit: cover;
    cursor: pointer;
    border: 1px solid var(--color-border-2);
  }
}

// 确保操作按钮有合适间距
:deep(.arco-table-operation) {
  .arco-btn {
    margin-left: 8px;
    + .arco-btn {
      margin-left: 4px;
    }
  }
}


</style>
