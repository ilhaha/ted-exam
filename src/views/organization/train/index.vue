<template>
  <div class="gi_table_page">
    <GiTable
      title="培训主表管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <!-- 添加状态显示插槽 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <!-- 新增封面图预览插槽 -->
      <template #coverPath="{ record }">
        <a-image
          v-if="record.coverPath"
          :src="record.coverPath"
          :width="120"
          :height="80"
          :preview="true"
          fit="cover"
          class="cover-image"
        />
        <span v-else class="no-cover">无封面</span>
      </template>
      <template #toolbar-left>
        <a-input-search v-model="queryForm.title" placeholder="请输入培训名称" allow-clear @search="search" />
        <!--        <a-input-search v-model="queryForm.totalDuration" placeholder="请输入视频总时长（秒）" allow-clear @search="search" /> -->
        <a-input-search v-model="queryForm.expertName" placeholder="请输入专家名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>

      <template #expertName="{ record }">
        {{ record.expertName || record.expertId || '未知' }}
      </template>

      <template #toolbar-right>
        <a-button v-permission="['training:training:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:training:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:training:detail']" title="培训内容" @click="onDetail(record)">培训内容</a-link>
          <a-link v-permission="['training:training:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:training:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <TrainingAddModal ref="TrainingAddModalRef" @save-success="search" />
    <TrainingDetailDrawer ref="TrainingDetailDrawerRef" @refresh="search" />
  </div>
</template>

<script setup lang="ts">
import TrainingAddModal from './TrainingAddModal.vue'
import TrainingDetailDrawer from './TrainingDetailDrawer.vue'
import { type TrainingQuery, type TrainingResp, deleteTraining, exportTraining, listTraining } from '@/apis/training/training'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { selectAnnouncement } from '@/apis/common/announcement'

defineOptions({ name: 'Training' })

const queryForm = reactive<TrainingQuery>({
  title: undefined,
  totalDuration: undefined,
  expertName: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((pageParams) =>
  listTraining({
    ...queryForm,
    page: pageParams.current, // 将current改为page
    size: pageParams.pageSize, // 将pageSize改为size
    sort: queryForm.sort, // 确保sort格式正确
  }), {
  immediate: true,
})

// 添加公告选项的响应式数据
const announcementOptions = ref([])

// 获取公告下拉选项
const getAnnouncementOptions = async () => {
  try {
    const { data } = await selectAnnouncement()
    // 假设返回的数据格式是 { id, title } 的数组
    announcementOptions.value = data.map((item) => ({
      label: item.title,
      value: item.id,
    }))
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

// 在组件挂载时获取公告选项
onMounted(() => {
  getAnnouncementOptions()
})

const columns = ref<TableInstanceColumns[]>([
  { title: '培训名称', dataIndex: 'title', slotName: 'title' },
  {
    title: '封面图',
    dataIndex: 'coverPath',
    slotName: 'coverPath',
    width: 150,
    align: 'center',
  },
  { title: '视频总时长（秒）', dataIndex: 'totalDuration', slotName: 'totalDuration' },
  { title: '专家名称', dataIndex: 'expertName', slotName: 'expertName' },
  { title: '培训课程售价', dataIndex: 'fee', slotName: 'fee' },
  { title: '培训描述', dataIndex: 'description', slotName: 'description' },
  {
    title: '审核状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 120,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 190,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:training:detail', 'training:training:update', 'training:training:delete']),
  },
])

// 状态映射函数
const getStatusText = (status: number) => {
  const statusMap = {
    0: '未审核',
    1: '审核通过',
    2: '审核不通过',
  }
  return statusMap[status] || '未知状态'
}

const getStatusColor = (status: number) => {
  const colorMap = {
    0: 'orange',
    1: 'green',
    2: 'red',
  }
  return colorMap[status] || 'gray'
}

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.totalDuration = undefined
  queryForm.expertName = undefined
  search()
}

// 删除
const onDelete = (record: TrainingResp) => {
  return handleDelete(() => deleteTraining(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportTraining(queryForm))
}

const TrainingAddModalRef = ref<InstanceType<typeof TrainingAddModal>>()
// 新增
const onAdd = () => {
  TrainingAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: TrainingResp) => {
  TrainingAddModalRef.value?.onUpdate(record.id)
}

const TrainingDetailDrawerRef = ref<InstanceType<typeof TrainingDetailDrawer>>()
// 详情
const onDetail = (record: TrainingResp) => {
  TrainingDetailDrawerRef.value?.onOpen(record.id)
}

// 当抽屉中的内容发生变化时，刷新主表数据
const handleDrawerChange = () => {
  search()
}
</script>

<style scoped lang="scss">
.cover-image {
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.no-cover {
  color: var(--color-text-3);
  font-size: 12px;
}

/* 确保分页可见 */
.gi_table_page :deep(.arco-table-pagination) {
  position: sticky;
  bottom: 0;
  background: var(--color-bg-2);
  z-index: 2;
  border-top: 1px solid var(--color-border);
}
</style>
