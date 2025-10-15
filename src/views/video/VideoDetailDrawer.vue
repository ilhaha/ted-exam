<template>
  <a-drawer v-model:visible="visible" title="视频详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="章节ID">{{ dataDetail?.chapterId }}</a-descriptions-item>
      <a-descriptions-item label="视频标题">{{ dataDetail?.title }}</a-descriptions-item>
      <a-descriptions-item label="视频时长（秒）">{{ dataDetail?.duration }}</a-descriptions-item>
      <a-descriptions-item label="视频路径">{{ dataDetail?.videoPath }}</a-descriptions-item>
      <a-descriptions-item label="排序序号">{{ dataDetail?.sort }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="0-未删除 1-已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type VideoDetailResp, getVideo as getDetail } from '@/apis/training/video'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<VideoDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
