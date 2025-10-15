<template>
  <div class="list-container">
    <StatusTabs
      :status-list="courseStatus"
      @change="handleStatusChange"
    />
    <div class="list-wrapper">
      <div class="course-list">
        <template v-if="filteredCourses.length">
          <a-grid :cols="4" :col-gap="16" :row-gap="16">
            <a-grid-item v-for="course in paginatedCourses" :key="course.id">
              <div class="course-card" @click="handleCourseClick(course)">
                <div class="course-bg" :style="{ backgroundImage: `url(${course.coverPath || '/static/images/test.jpg'})` }">
                  <div class="course-overlay">
                    <div class="course-content">
                      <h3 class="course-name">{{ course.title }}</h3>
                      <div class="course-info">
                        <p class="course-teacher">讲师：{{ course.expertName }}</p>
                        <div class="course-progress">
                          <div class="progress-text">
                            <span>已学 {{ course.learningTime }}/{{ course.totalDuration }}分钟</span>
                            <span>{{ course.learningPercentage }}%</span>
                          </div>
                          <a-progress
                            :percent="getProgressPercent(course)"
                            :show-text="false"

                            size="small"
                            :color="getProgressColor(course.status)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="course-footer">
                  <div class="course-duration">
                    <IconClockCircle class="icon" />
                    <span>总时长 {{ course.totalDuration }}分钟</span>
                  </div>
                  <!-- :class="course.status.toLowerCase()" -->
                  <div class="course-status">
                    {{ getStatusText(course.status) }}
                  </div>
                </div>
              </div>
            </a-grid-item>
          </a-grid>
          <div class="pagination-wrapper">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              size="small"
              show-total
              show-jumper
              @change="handlePageChange"
            />
          </div>
        </template>
        <div v-else class="empty-state">
          <a-empty>
            <template #image>
              <IconBook style="font-size: 48px; color: var(--color-text-3);" />
            </template>
            <template #description>
              {{ currentStatus === 'all' ? '暂无培训课程' : '暂无相关状态的课程' }}
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconBook, IconClockCircle } from '@arco-design/web-vue/es/icon'
import StatusTabs from './StatusTabs.vue'
import { listTraining } from '@/apis/training/training'

interface Course {
  id: string
  name: string
  imageUrl: string
  teacher: string
  totalHours: number
  learnedHours: number
  status: string
  startTime: string
  endTime: string
  description: string
  category: string
  level: string
  learningPercentage: number
}

const props = defineProps<{
  courses: Course[]
}>()

// 定义状态映射关系
const statusMapping = {
  all: -1,
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
}

// 添加分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

// 修改状态切换处理
const handleStatusChange = async (status: string) => {
  currentStatus.value = status
  pagination.value.current = 1 // 切换状态时重置到第一页
  await fetchCourseList()
}

// 修改分页处理
const handlePageChange = async (page: number) => {
  pagination.value.current = page
  await fetchCourseList()
}

// 重构后的获取数据方法
const fetchCourseList = async () => {
  try {
    const response = await listTraining({
      status: (Number)(statusMapping[currentStatus.value]),
      page: pagination.value.current,
      size: pagination.value.pageSize,
    })

    courses.value = response.data.list // 更新响应式变量
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('获取课程数据失败：', error)
  }
}

const courseStatus = [
  { label: '未开始', value: 'NOT_STARTED', icon: 'icon-clock-circle' },
  { label: '学习中', value: 'IN_PROGRESS', icon: 'icon-play-circle' },
  { label: '已完成', value: 'COMPLETED', icon: 'icon-check-circle' },
]

const currentStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const router = useRouter()
// 添加响应式变量
const courses = ref<Course[]>([])

const filteredCourses = computed(() => {
  // 确保始终返回数组
  const source = courses.value || []

  if (currentStatus.value === 'all') return source

  return source.filter(course => {
    // 添加空值保护
    if (!course) return false
    return true
  })
})

// const paginatedCourses = computed(() => {
//   const start = (currentPage.value - 1) * pageSize.value
//   const end = start + pageSize.value
//   return filteredCourses.value.map((course) => ({
//     ...course,
//     imageUrl: '/static/images/test.jpg',
//   })).slice(start, end)
// })

// const handleStatusChange = (status: string) => {
//   currentStatus.value = status
//   currentPage.value = 1
// }

const getProgressColor = (status: string) => {
  const colorMap = {
    NOT_STARTED: 'rgb(var(--warning-6))',
    IN_PROGRESS: 'rgb(var(--primary-6))',
    COMPLETED: 'rgb(var(--success-6))',
  }
  return colorMap[status] || 'rgb(var(--primary-6))'
}

const getStatusText = (status: string) => {
  const statusMap = {
    NOT_STARTED: '未开始',
    IN_PROGRESS: '学习中',
    COMPLETED: '已完成',
  }
  return statusMap[status] || '未知'
}

const paginatedCourses = computed(() => {
  return filteredCourses.value
    .map((course) => ({
      ...course,
      imageUrl: '/static/images/test.jpg',
    }))
    .slice(
      (pagination.value.current - 1) * pagination.value.pageSize,
      pagination.value.current * pagination.value.pageSize,
    )
})

// 初始化加载数据
onMounted(() => {
  fetchCourseList()
})

const getProgressPercent = (course: Course) => {
  if (course.learningPercentage === 0) return 0

  console.log('学习百分比', course.learningPercentage)
  return course.learningPercentage / 100
}

const handleCourseClick = (course: Course) => {
  router.push({ path: `/training/${course.id}` })
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

.course-list {
  padding: 8px 0;
}

.course-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.course-bg {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.1) 0%,
          rgba(0, 0, 0, 0.8) 100%
  );
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.course-content {
  color: white;
}

.course-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.4;
}

.course-info {
  font-size: 14px;
  opacity: 0.9;

  .course-teacher {
    margin-bottom: 8px;
  }
}

.course-progress {
  .progress-text {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 12px;
    opacity: 0.9;
  }
}

.course-footer {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-neutral-3);

  .course-duration {
    display: flex;
    align-items: center;
    color: var(--color-text-2);
    font-size: 13px;

    .icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }

  .course-status {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;

    &.not_started {
      background-color: rgb(var(--warning-6));
    }

    &.in_progress {
      background-color: rgb(var(--primary-6));
    }

    &.completed {
      background-color: rgb(var(--success-6));
    }
  }
}

.pagination-wrapper {
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 64px 0;
}
</style>
