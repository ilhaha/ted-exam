<template>
  <div class="gi_table_page">
    <GiTable
      title="视频管理"
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
	    <a-input-search v-model="queryForm.chapterId" placeholder="请输入章节ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.title" placeholder="请输入视频标题" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.duration" placeholder="请输入视频时长（秒）" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.videoPath" placeholder="请输入视频路径" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:video:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:video:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:video:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:video:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:video:delete']"
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

    <VideoAddModal ref="VideoAddModalRef" @save-success="search" />
    <VideoDetailDrawer ref="VideoDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import VideoAddModal from './VideoAddModal.vue'
import VideoDetailDrawer from './VideoDetailDrawer.vue'
import { type VideoResp, type VideoQuery, deleteVideo, exportVideo, listVideo } from '@/apis/training/video'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Video' })


const queryForm = reactive<VideoQuery>({
  chapterId: undefined,
  title: undefined,
  duration: undefined,
  videoPath: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listVideo({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '章节ID', dataIndex: 'chapterId', slotName: 'chapterId' },
  { title: '视频标题', dataIndex: 'title', slotName: 'title' },
  { title: '视频时长（秒）', dataIndex: 'duration', slotName: 'duration' },
  { title: '视频路径', dataIndex: 'videoPath', slotName: 'videoPath' },
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
    show: has.hasPermOr(['training:video:detail', 'training:video:update', 'training:video:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.chapterId = undefined
  queryForm.title = undefined
  queryForm.duration = undefined
  queryForm.videoPath = undefined
  search()
}

// 删除
const onDelete = (record: VideoResp) => {
  return handleDelete(() => deleteVideo(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportVideo(queryForm))
}

const VideoAddModalRef = ref<InstanceType<typeof VideoAddModal>>()
// 新增
const onAdd = () => {
  VideoAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: VideoResp) => {
  VideoAddModalRef.value?.onUpdate(record.id)
}

const VideoDetailDrawerRef = ref<InstanceType<typeof VideoDetailDrawer>>()
// 详情
const onDetail = (record: VideoResp) => {
  VideoDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
