<template>
  <div class="gi_table_page">
    <GiTable
      title="培训主表管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
	    <a-input-search v-model="queryForm.title" placeholder="请输入培训名称" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.totalDuration" placeholder="请输入视频总时长（秒）" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.expertId" placeholder="请输入专家ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
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
import TrainingAddModal from '@/views/training/TrainingAddModal.vue'
import TrainingDetailDrawer from '@/views/training/TrainingDetailDrawer.vue'
import { type TrainingResp, type TrainingQuery, deleteTraining, exportTraining, listTraining } from '@/apis/training/training'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'TrainingLesson' })


const queryForm = reactive<TrainingQuery>({
  title: undefined,
  totalDuration: undefined,
  expertId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listTraining({ ...queryForm, ...page }), { immediate: true })



// 在组件挂载时获取公告选项
onMounted(() => {
  console.log(111222);
  
})

const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '培训名称', dataIndex: 'title', slotName: 'title' },
  { title: '封面路径', dataIndex: 'coverPath', slotName: 'coverPath' },
  { title: '视频总时长（秒）', dataIndex: 'totalDuration', slotName: 'totalDuration' },
  { title: '专家ID', dataIndex: 'expertId', slotName: 'expertId' },
  { title: '费用', dataIndex: 'fee', slotName: 'fee' },
  { title: '培训描述', dataIndex: 'description', slotName: 'description' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 190,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:training:detail', 'training:training:update', 'training:training:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.totalDuration = undefined
  queryForm.expertId = undefined
  search()
}

// 删除
const onDelete = (record: TrainingResp) => {
  return handleDelete(() => deleteTraining(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
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

// 获取公告下拉列表
const getAnnouncementList = async () => {
  try {
    const { data } = await selectAnnouncement()
    // 更新公告选项
    columns.value = columns.value.map(col => {
      if (col.field === 'announcementId') {
        return {
          ...col,
          props: {
            ...col.props,
            options: data.map((item: any) => ({
              label: item.title,
              value: item.id
            }))
          }
        }
      }
      return col
    })
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

// 在组件挂载时获取公告列表
onMounted(() => {
  getAnnouncementList()
})
</script>

<style scoped lang="scss"></style>
