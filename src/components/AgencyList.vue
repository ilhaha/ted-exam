<template>
  <div class="list-container">
    <StatusTabs
      :status-list="agencyStatus"
      @change="handleStatusChange"
    />
    <div class="list-wrapper">
      <div class="cert-list">
        <div v-if="loading" class="loading-state">
          <a-spin />
        </div>
        <template v-else-if="agencyList && agencyList.length > 0">
          <div class="agency-list">
            <div
              v-for="(agency, index) in agencyList"
              :key="index"
              class="agency-item"
              @click="handleAgencyClick(agency)"
            >
              <a-card class="agency-card" :bordered="false">
                <div class="agency-content">
                  <div class="agency-left">
                    <div class="agency-image-wrapper">
                      <img
                        class="agency-image"
                        :src="agency.businessLicense || '/static/images/test.jpg'"
                        alt="机构照片"
                      />
                    </div>
                  </div>
                  <div class="agency-main">
                    <h3 class="agency-name">{{ agency.name }}</h3>
                    <div class="agency-info">
                      <span class="agency-id">机构代号：{{ agency.code }}</span>
                    </div>
                    <div class="agency-dates">
                      <span>创建时间：{{ agency.createTime }}</span>
                    </div>
                  </div>
                  <div class="agency-arrow">
                    <IconRight />
                  </div>
                </div>
              </a-card>
            </div>
          </div>
          <div class="pagination-wrapper">
            <a-pagination
              v-model:current="currentPage"
              :total="total"
              :page-size="pageSize"
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
              <IconCalendar style="font-size: 48px; color: var(--color-text-3);" />
            </template>
            <template #description>
              {{ currentStatus === 'all' ? '暂无考试机构' : '暂无相关状态的考试机构' }}
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconCalendar, IconRight } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import StatusTabs from './StatusTabs.vue'
import { getAgencyStatusList } from '@/apis/org/org'

const emit = defineEmits(['select'])

// 考试机构状态
const agencyStatus = [
  { label: '所属机构', value: '1', icon: 'icon-check-circle' },
]

// 标签状态(全部/所属机构)
const currentStatus = ref('all')
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
// 总条数
const total = ref(0)
// 考试机构列表
const agencyList = ref([
  {
    code: '',
    name: '',
    createTime: '',
  },
])
// 加载状态动画
const loading = ref(false)

// 获取考试机构列表
const fetchAgencyList = async () => {
  loading.value = true
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    const res = await getAgencyStatusList(currentStatus.value, params)
    if (res?.data) {
      agencyList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取考试计划列表失败：', error)
    Message.error('获取考试计划列表失败')
    agencyList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 切换标签
const handleStatusChange = async (status: string) => {
  // 设置当前状态0/1
  currentStatus.value = status
  // 切换页数为1
  currentPage.value = 1
  await fetchAgencyList()
}

// 切换页码
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchAgencyList()
}

// 查看机构详情
const handleAgencyClick = (agency: any) => {
  emit('select', agency)
}

// 初始化考试机构列表
onMounted(() => {
  fetchAgencyList()
})

defineExpose({
  fetchAgencyList,
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

.agency-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agency-item {
  width: 100%;
}

.agency-card {
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

.agency-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-bg-1);
}

.agency-left {
  flex-shrink: 0;
}

.agency-image-wrapper {
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

.agency-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agency-status {
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

.agency-main {
  flex: 1;
  min-width: 0;

  .agency-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agency-info {
    display: flex;
    gap: 24px;
    margin-bottom: 8px;
    color: var(--color-text-2);
    font-size: 14px;
  }

  .agency-dates {
    display: flex;
    gap: 24px;
    color: var(--color-text-3);
    font-size: 13px;
  }
}

.agency-arrow {
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
