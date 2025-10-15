<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <div>
        <strong class="notice-text">通知公告</strong>
        <div v-for="(poem, index) in poems" :key="index">
          <el-link class="custom-link"
                   @click.prevent="goCarousel(poem.uri)">
            · {{ poem.title }}
          </el-link>
        </div>
      </div>
    </el-col>
    <el-col :span="12">
      <div>
        <strong class="notice-text">最新动态</strong>
        <div v-for="(poem, index) in poems" :key="index">
          <el-link class="custom-link"
                   :href="poem.uri"
                   target="_blank">
            · {{ poem.title }}
          </el-link>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listAnnouncementIndex } from '@/apis/common/announcement'

// 获取路由实例
const router = useRouter()

// 将 poems 设置为响应式数据
const poems = ref([
])

// 获取首页公告
async function fetchAnnouncement() {
  try {
    const announcementResp = await listAnnouncementIndex()
    const { data } = announcementResp
    // 用获取到的数据更新 poems
    poems.value = data
  } catch (error) {
    console.error('获取公告失败：', error)
  }
}

// 在组件挂载时获取公告
onMounted(() => {
  fetchAnnouncement()
})

function goCarousel(id: string) {
    router.push(`/carousel/${id}`)
}
</script>

<style scoped lang="scss">
.notice-text {
  font-size: 25px;
  font-weight: bold; /* 加粗 */
  display: block; /* 转换为块级元素 */
  font-family: 'SimSun', '宋体', serif; /* 使用宋体 */
  color: black; /* 字体颜色为黑色 */
}

.custom-link {
  font-size: 25px;
  margin-top: 10px;
  margin-bottom: 10px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-family: 'SimSun', '宋体', serif; /* 使用宋体 */
  color: black; /* 默认字体颜色为黑色 */

  /* 鼠标经过时字体颜色变为蓝色 */
  &:hover {
    color: blue;
  }
}
</style>