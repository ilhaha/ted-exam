<template>
  <div class="gi_table_page">
    <GiTable
      title="章节表管理"
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
	    <a-input-search v-model="queryForm.trainingId" placeholder="请输入培训ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.title" placeholder="请输入章节标题" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:chapter:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:chapter:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:chapter:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:chapter:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:chapter:delete']"
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

    <ChapterAddModal ref="ChapterAddModalRef" @save-success="search" />
    <ChapterDetailDrawer ref="ChapterDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ChapterAddModal from './ChapterAddModal.vue'
import ChapterDetailDrawer from './ChapterDetailDrawer.vue'
import { type ChapterResp, type ChapterQuery, deleteChapter, exportChapter, listChapter } from '@/apis/training/chapter'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Chapter' })


const queryForm = reactive<ChapterQuery>({
  trainingId: undefined,
  title: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listChapter({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '培训ID', dataIndex: 'trainingId', slotName: 'trainingId' },
  { title: '章节标题', dataIndex: 'title', slotName: 'title' },
  { title: '父章节ID', dataIndex: 'parentId', slotName: 'parentId' },
  { title: '排序序号', dataIndex: 'sort', slotName: 'sort' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '0-未删除 1-已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:chapter:detail', 'training:chapter:update', 'training:chapter:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.trainingId = undefined
  queryForm.title = undefined
  search()
}

// 删除
const onDelete = (record: ChapterResp) => {
  return handleDelete(() => deleteChapter(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportChapter(queryForm))
}

const ChapterAddModalRef = ref<InstanceType<typeof ChapterAddModal>>()
// 新增
const onAdd = () => {
  ChapterAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ChapterResp) => {
  ChapterAddModalRef.value?.onUpdate(record.id)
}

const ChapterDetailDrawerRef = ref<InstanceType<typeof ChapterDetailDrawer>>()
// 详情
const onDetail = (record: ChapterResp) => {
  ChapterDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
