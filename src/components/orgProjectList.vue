<template>
  <div class="list-container">
    <div class="list-wrapper">
      <div class="project-list">
        <div v-if="loading" class="loading-state">
          <a-spin/>
        </div>
        <template v-else-if="projectList && projectList.length > 0">
          <div class="project-grid">
            <div v-for="project in projectList"
                 :key="project.id"
                 class="project-item"
                 @click="handleProjectClick(project)"
            >
              <a-card class="project-card" :bordered="false">
                <div class="project-image-wrapper">
                  <img
                      class="project-image"
                      :src="project.imageUrl || '/static/images/test.jpg'"
                      alt="项目图片"
                  />
                </div>
                <div class="project-content">
                  <h3 class="project-name" :title="project.projectName">{{ project.projectName }}</h3>
                  <div class="project-info">
                    <div class="project-code">项目代码：{{ project.projectCode }}</div>
                    <div class="project-org">所属机构：{{ project.deptName }}</div>
                  </div>
                  <div class="project-status">
                    <a-tag :color="getStatusColor(project.projectStatus)">
                      {{ getStatusText(project.projectStatus) }}
                    </a-tag>
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
              <icon-file style="font-size: 48px; color: var(--color-text-3);"/>
            </template>
            <template #description>
              暂无项目
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {getProjectList, getProjectStatusList} from '@/apis/project/project'
import {Message} from '@arco-design/web-vue'
import StatusTabs from './StatusTabs.vue'
import type {ProjectResp} from "@/apis/project/project";

const emit = defineEmits<{
  (e: 'select', project: ProjectResp): void
}>()

const projectStatus = [

  {label: '已上架', value: 1, icon: 'icon-clock-circle'},
  {label: '进行中', value: 2, icon: 'icon-clock-circle'},
]

const currentStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const projectList = ref([])
const loading = ref(false)

// 修改接口返回数据的类型定义
interface ProjectItem {
  id: number;
  projectName: string;
  projectCode: string;
  deptName: string;
  examDuration: number;
  realm: string;
  imageUrl: string | null;
  updateTime: string | null;
  createTime: string | null;
  createUserString: string | null;
}

interface ProjectResponse {
  list: ProjectItem[];
  total: number;
}

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    let response

    if (currentStatus.value === 'all') {
      response = await getProjectList(params)
    } else {
      response = await getProjectStatusList(currentStatus.value, params)
    }

    if (response?.data) {
      // 修改数据获取方式，使用 list 字段
      projectList.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('获取项目列表失败：', error)
    Message.error('获取项目列表失败')
    projectList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchProjectList()
}

// 处理状态变化
const handleStatusChange = async (status: string) => {
  currentStatus.value = status
  currentPage.value = 1  // 切换状态时重置页码
  await fetchProjectList()
}

const handleProjectClick = (project: ProjectResp) => {
  emit('select', project)
}

onMounted(() => {
  fetchProjectList()
})

// 添加项目相关的公告
const notices = [
  '新项目"企业管理系统"已成功上线',
  '项目展示模块新增技术栈筛选功能',
  '优秀项目评选活动即将开始'
]

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 1:
      return 'green'  // 已上架状态
    case 2:
      return 'blue'   // 进行中状态
    default:
      return 'gray'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 1:
      return '已上架'
    case 2:
      return '进行中'
    default:
      return '未知状态'
  }
}
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

.project-list {
  padding: 16px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.project-item {
  cursor: pointer;
}

.project-card {
  height: 100%;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  :deep(.arco-card-body) {
    padding: 0;
  }
}

.project-image-wrapper {
  width: 100%;
  height: 160px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.project-content {
  padding: 16px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-info {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 12px;

  .project-code, .project-org {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  }
}

.project-status {
  display: flex;
  justify-content: flex-end;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}
</style>