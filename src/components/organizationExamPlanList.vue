<template>
  <div class="list-container">

    <div class="list-wrapper">
      <div class="cert-list">
        <div v-if="loading" class="loading-state">
          <a-spin />
        </div>
        <template v-else-if="examList && examList.length > 0">
          <div class="exam-list">
            <div
              v-for="exam in examList"
              :key="exam.examPlanId || exam.id"
              class="exam-item"
              @click="handleExamClick(exam)"
            >
              <a-card class="exam-card" :bordered="false">
                <div class="exam-content">
                  <div class="exam-left">
                    <div class="exam-image-wrapper">
                      <img
                        class="exam-image"
                        :src="exam.imageUrl || '/static/images/test.jpg'"
                        alt="考试图片"
                      />
                    </div>
                  </div>
                  <div class="exam-main">
                    <h3 class="exam-name">{{ exam.examPlanName }}</h3>
                    <div class="exam-info">
                      <span class="exam-id">计划编号：{{ exam.examPlanId || exam.id }}</span>
                    </div>
                    <div class="exam-dates">
                      <span>考试时间：{{ exam.examStartTime || exam.startTime }}</span>
                      <span>报名截止：{{ exam.enrollEndTime }}</span>
                    </div>
                  </div>
                  <div class="exam-arrow">
                    <icon-right />
                  </div>
                </div>
              </a-card>
            </div>
          </div>
          <div class="pagination-wrapper">
            <a-pagination
              :total="total"
              :page-size="pageSize"
              v-model:current="currentPage"
              size="small"
              show-total
              :hide-on-single-page="false"
              @change="handlePageChange"
            />
          </div>
        </template>
        <div v-else class="empty-state">
          <a-empty>
            <template #image>
              <icon-calendar style="font-size: 48px; color: var(--color-text-3);" />
            </template>
            <template #description>
              {{ currentStatus === 'all' ? '暂无考试计划' : '暂无相关状态的考试计划' }}
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCalendar, IconRight } from '@arco-design/web-vue/es/icon'
import type { EnrollResp } from '@/apis/plan/examPlan'
import { getExamPlanStatusList } from '@/apis/plan/examPlan'

const currentStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const examList = ref([])
const loading = ref(false)

// props
const props = defineProps<{
  exams: EnrollResp[]
}>()

const emit = defineEmits(['select'])

const fetchExamList = async () => {
  loading.value = true
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    const response = await getExamPlanStatusList(currentStatus.value, params)

    if (response?.data) {
      examList.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('获取考试计划列表失败：', error)
    Message.error('获取考试计划列表失败')
    examList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchExamList()
}

const handleExamClick = (exam: any) => {
  emit('select', exam)
}

onMounted(() => {
  fetchExamList()
})
</script>

<style scoped lang="scss">
.list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.list-wrapper {
  flex: 1;
  overflow: auto;
}

.cert-list {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-item {
  width: 100%;
}

.exam-card {
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
    border-color: var(--color-border-3);
  }
}

.exam-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-bg-1);
}

.exam-left {
  flex-shrink: 0;
}

.exam-image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  .status-tag {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px;
    
    :deep(.arco-tag) {
      margin: 0;
      border: none;
      font-size: 12px;
      line-height: 1.2;
      padding: 2px 6px;
      border-radius: 0 4px 0 4px;
    }
  }
}

.exam-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exam-status {
  position: absolute;
  top: 0;
  right: 0;
  width: 65%;
  padding: 4px 0;
  font-size: 13px;
  text-align: center;
  white-space: nowrap;
  color: #fff;
  border-radius: 0 4px 0 4px;
  
  &.upcoming {
    background-color: rgba(var(--warning-6), 0.95);
  }
  
  &.registered {
    background-color: rgba(var(--success-6), 0.95);
  }
  
  &.completed {
    background-color: rgba(var(--primary-6), 0.95);
  }
  
  &.expired {
    background-color: rgba(var(--danger-6), 0.95);
  }
}

.exam-main {
  flex: 1;
  min-width: 0;

  .exam-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .exam-info {
    display: flex;
    gap: 24px;
    margin-bottom: 8px;
    color: var(--color-text-2);
    font-size: 14px;
  }

  .exam-dates {
    display: flex;
    gap: 24px;
    color: var(--color-text-3);
    font-size: 13px;
  }
}

.exam-arrow {
  color: var(--color-text-3);
  font-size: 20px;
  display: flex;
  align-items: center;
}

.pagination-wrapper {
  padding: 20px 0 50px 0;
  //margin-top: 16px;
  display: flex;
  justify-content: center;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.notice-bar {
  margin-bottom: 16px;
  padding: 8px 16px;
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

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}
</style> 