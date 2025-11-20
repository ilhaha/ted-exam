<template>
  <div class="invigilator-page">
    <a-card :bordered="false" class="exam-card">
      <template #title>
        <div class="exam-header">
          <div class="exam-subject">📘 考试科目：<span>{{ userStore.planName }}</span></div>
          <div class="exam-subject">📍 考试考场：<span>{{ userStore.classroomName }}</span></div>
          <div class="exam-time">🕘 考试时间：<span>{{ userStore.examTime }}</span></div>
        </div>
      </template>

      <div class="exam-toolbar">
        <div class="search-controls">
          <a-input v-model="searchKeyword" placeholder="请输入考生姓名进行搜索" allow-clear style="width: 250px"
            @press-enter="handleSearch" @clear="handleSearch">
            <template #suffix>
              <icon-search @click="handleSearch" style="cursor: pointer; color: #409eff;" />
            </template>
          </a-input>
        </div>
        <div class="toolbar-actions"> <a-tooltip content="刷新">
            <a-button @click="handleRefresh">
              <template #icon><icon-refresh /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="结束考试">
            <a-button status="danger" @click="handleFinish">
              <template #icon><icon-export /></template>
              结束
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <a-table :columns="columns" :data="candidatesList" row-key="id" :pagination="false" />

      <a-pagination :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total" show-total
        show-jumper show-page-size @change="onPageChange" @page-size-change="onPageSizeChange" />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, h } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { useUserStore } from '@/stores'
import { getExamCandidates, type EnrollPageQuery } from '@/apis/enroll/index'
import { generateExamQuestionBank } from '@/apis/questionBank/index'
import { endExam } from '@/apis/exam/index'
import { Message, Modal } from "@arco-design/web-vue";

const router = useRouter()

import dayjs from 'dayjs'


const userStore = useUserStore()

const searchKeyword = ref('')
const candidatesList = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const columns: TableColumnData[] = [
  { title: '姓名', dataIndex: 'nickname', align: 'center' },
  { title: '身份证号', dataIndex: 'username', align: 'center' },
  { title: '准考证号', dataIndex: 'examNumber', align: 'center' },
  {
    title: '状态',
    dataIndex: 'examStatus',
    align: 'center',
    render: ({ record }) => {
      const statusMap = {
        0: { text: '未签到', class: 'status unchecked' },
        1: { text: '已签到', class: 'status checked' },
        2: { text: '已交卷', class: 'status submitted' },
      }

      const status = statusMap[record.examStatus] || { text: '未知状态', class: 'status unknown' }
      return h('span', { class: status.class }, status.text)
    }
  }
]

// 拉取考生数据
const fetchCandidates = async () => {
  const params: EnrollPageQuery = {
    page: pagination.value.current,
    size: pagination.value.pageSize,
  }

  if (searchKeyword.value) {
    params.nickname = searchKeyword.value
  }

  const res = await getExamCandidates(userStore.planId, userStore.classroomId, params)

  if (res && res.data) {
    candidatesList.value = res.data.list
    pagination.value.total = res.data.total
  }
}

const handleFinish = () => {
  const endTime = getExamEndTime()
  const now = dayjs()

  if (!endTime) {
    Message.error('考试结束时间格式错误，无法判断')
    return
  }

  if (now.isBefore(endTime)) {
    Message.warning('未到达考试结束时间，暂时无法结束考试')
    return
  }

  Modal.confirm({
    title: '确认结束考试',
    content: '考试已到达结束时间，您确认要结束本次考试吗？',
    okText: '确认结束',
    cancelText: '取消',
    onOk: async () => {
      await endExam(userStore.planId);
      Message.success('考试已成功结束')
      await router.push({
        path: '/invigilatorExamEnd'
      })
    }
  })
}

const getExamEndTime = () => {
  const timeRange = userStore.examTime
  const parts = timeRange.split('——')

  if (parts.length === 2) {
    const end = parts[1].trim()
    const endFormatted = end.replace(/年|月/g, '-').replace('日', '')
    return dayjs(endFormatted)
  }

  return null
}


const handleSearch = () => {
  pagination.value.current = 1
  fetchCandidates()
}

const handleRefresh = () => {
  searchKeyword.value = ''
  pagination.value.current = 1
  fetchCandidates()
}

const onPageChange = (page: number) => {
  pagination.value.current = page
  fetchCandidates()
}

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  fetchCandidates()
}

const initQuestionBank = async () => {
  console.log(userStore.username);

  // await generateExamQuestionBank(userStore.planId)
}

onMounted(() => {
  initQuestionBank()
  fetchCandidates()
})
</script>

<style scoped lang="scss">
.exam-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 12px;

  .search-controls {
    display: flex;
    align-items: center;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;

    button {
      margin-left: 8px;
    }
  }
}

.invigilator-page {
  padding: 16px;
  overflow-y: auto;

  .exam-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    background: #ffffff;
    padding: 10px;

    .exam-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      row-gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #1f1f1f;

      .exam-subject {
        flex: 1 1 30%;
        min-width: 200px;

        span {
          font-weight: normal;
          color: #555;
          margin-left: 6px;
        }
      }

      .exam-time {
        flex: 1 1 32%;
        min-width: 200px;

        span {
          font-weight: normal;
          color: #555;
          margin-left: 6px;
        }
      }
    }
  }
}

.exam-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 12px;

  .search-controls {
    display: flex;
    align-items: center;

    .arco-input-wrapper {
      transition: border 0.3s;

      &:hover {
        border-color: #409eff;
      }
    }

    .icon-search {
      transition: color 0.2s;

      &:hover {
        color: #005bbb;
      }
    }
  }

  button {
    margin-left: 8px;
  }
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  min-width: 70px;
  text-align: center;
  transition: all 0.3s ease;

  &.checked {
    background-color: #f6ffed;
    color: #389e0d;
    border: 1px solid #b7eb8f;
  }

  &.unchecked {
    background-color: #fff1f0;
    color: #cf1322;
    border: 1px solid #ffa39e;
  }

  &.submitted {
    background-color: #e6f4ff;
    color: #1677ff;
    border: 1px solid #91caff;
  }

  &.unknown {
    background-color: #fafafa;
    color: #999999;
    border: 1px solid #d9d9d9;
  }
}

.arco-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: end;
}
</style>