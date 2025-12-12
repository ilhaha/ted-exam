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
        <div class="toolbar-actions">
          <a-tooltip content="刷新">
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

      <!-- 表格滚动容器 -->
      <div class="table-wrapper">
        <a-table :columns="columns" :data="candidatesList" row-key="id" :pagination="false" :loading="loading">
          <template #examStatus="{ record }">
            <a-tag :color="getExamStatusColor(record.examStatus)" bordered>
              {{ getExamStatusText(record.examStatus) }}
            </a-tag>
          </template>
          <template #action="{ record }">
            <a-space>
              <a-popconfirm content="确认重新生成试卷？此操作会覆盖已生成的试卷，无法恢复。" ok-text="确认" cancel-text="取消"
                @ok="generatePaper(record)">
                <a-link v-permission="['exam:paper:generate']" title="重新生成试卷"
                  v-if="record.examStatus == 1">考卷重置</a-link>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>

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
import { restGenerateExamQuestionBank } from '@/apis/questionBank/index'
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { endExam } from '@/apis/exam/index'
import { Message, Modal } from "@arco-design/web-vue";
import { useRouter } from 'vue-router' // 补充导入
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const candidatesList = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})
const loading = ref(false)

const columns: TableColumnData[] = [
  { title: '姓名', dataIndex: 'nickname', align: 'center' },
  { title: '身份证号', dataIndex: 'username', align: 'center' },
  { title: '准考证号', dataIndex: 'examNumber', align: 'center' },
  { title: "状态", dataIndex: "examStatus", slotName: "examStatus", },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 200,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:examPlan:detail",
      "exam:examPlan:update",
      "exam:examPlan:delete",
    ]),
  },
]

// 重新生成试卷
const generatePaper = async (record: any) => {
  await restGenerateExamQuestionBank({ planId: userStore.planId, examNumber: record.examNumber, candidateId: record.id });
  Message.success('试卷生成成功')
}

// 拉取考生数据
const fetchCandidates = async () => {
  const params: EnrollPageQuery = {
    page: pagination.value.current,
    size: pagination.value.pageSize,
  }

  if (searchKeyword.value) {
    params.nickName = searchKeyword.value
  }
  try {
    loading.value = true
    const res = await getExamCandidates(userStore.planId, userStore.classroomId, params)

    if (res && res.data) {
      candidatesList.value = res.data.list
      pagination.value.total = res.data.total
    }
  } finally {
    loading.value = false
  }

}

const handleFinish = () => {
  // const endTime = getExamEndTime()
  // const now = dayjs()

  // if (!endTime) {
  //   Message.error('考试结束时间格式错误，无法判断')
  //   return
  // }

  // if (now.isBefore(endTime)) {
  //   Message.warning('未到达考试结束时间，暂时无法结束考试')
  //   return
  // }

  

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

const getExamStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "red";      // 未签到
    case 1:
      return "blue";     // 已签到
    case 2:
      return "green";    // 已交卷
    default:
      return "default";
  }
};
const getExamStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "未签到";
    case 1:
      return "已签到";
    case 2:
      return "已交卷";

    default:
      return "未知状态";
  }
};



onMounted(() => {
  fetchCandidates()
})
</script>

<style scoped lang="scss">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.invigilator-page {
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止页面整体滚动 */

  .exam-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    background: #ffffff;
    padding: 20px;
    /* 增加内边距，优化布局 */
    box-sizing: border-box;

    /* 头部 */
    .exam-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      row-gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #1f1f1f;
      margin-bottom: 20px;

      .exam-subject,
      .exam-time {
        flex: 1 1 30%;
        min-width: 200px;
        display: flex;
        align-items: center;

        span {
          font-weight: normal;
          color: #555;
          margin-left: 6px;
        }
      }
    }

    /* 工具栏 */
    .exam-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;

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
          cursor: pointer;

          &:hover {
            color: #005bbb;
          }
        }
      }

      .toolbar-actions {
        display: flex;
        gap: 8px;

        button {
          margin-left: 0;
          /* 移除默认边距，用gap控制 */
        }
      }
    }

    /* 关键：表格滚动容器 */
    .table-wrapper {
      flex: 1;
      /* 占满剩余空间 */
      min-height: 200px;
      /* 设置最小高度，防止内容过少时变形 */
      max-height: calc(100vh - 240px);
      /* 限制最大高度，确保不会超出屏幕 */
      overflow-y: auto;
      /* 垂直滚动 */
      border-radius: 8px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;

      /* 滚动条样式优化 */
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d0d0d0;
        border-radius: 3px;
        transition: background 0.2s;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #b0b0b0;
      }
    }

    /* 分页样式 */
    .arco-pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
    }
  }
}

/* 响应式调整：小屏幕下优化布局 */
@media (max-width: 768px) {
  .invigilator-page {
    padding: 8px;
  }

  .exam-card {
    padding: 12px;
  }

  .exam-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 8px;
  }

  .exam-subject,
  .exam-time {
    flex: 1 1 100% !important;
    min-width: auto !important;
  }

  .table-wrapper {
    max-height: calc(100vh - 300px) !important;
  }
}
</style>
