<template>
  <el-carousel :interval="4000" height="100%">
    <el-carousel-item v-for="item in images" :key="item">
      <img 
        :src="item.imageUrl" 
        class="carousel-image" 
        @click="handleImageClick(item.announcementId)"
        style="cursor: pointer;"
      >
    </el-carousel-item>
  </el-carousel>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { carouselIndex } from '@/apis/common/carousel'
import {useRouter} from "vue-router";

const router = useRouter()

const images = ref([
])

// 获取轮播图数据
async function fetchCarousel() {
  try {
    const carouselResp = await carouselIndex()
    const { data } = carouselResp
    // 使用 .value 更新响应式数据
    images.value = data
  } catch (error) {
    console.error('获取轮播图失败：', error)
  }
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchCarousel()
})

// 添加点击处理函数
const handleImageClick = (id: string) => {
  // 在新窗口打开链接
  // window.open(url, '_blank')
  router.push({path: `/carousel/${id}`})
}
</script>

<style scoped lang="scss">
:deep(.el-carousel) {
  height: 100%;
}

:deep(.el-carousel__container) {
  height: 100%;
}

:deep(.el-carousel__item) {
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
    transition: opacity 0.3s;
  }
}

// 优化轮播图控制按钮样式
:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

:deep(.el-carousel__indicators) {
  bottom: 20px;
  
  .el-carousel__button {
    width: 30px;
    border-radius: 4px;
  }
}
</style>