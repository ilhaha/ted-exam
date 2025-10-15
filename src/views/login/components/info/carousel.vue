<template>
  <!-- 顶部导航 -->
  <div class="login-container">
    <!-- 顶部导航 -->
    <div class="nav-header">
      <div class="nav-content">
        <div class="logo-section" @click="goBack">
          <img src="/logo.svg" alt="logo" class="logo" />
          <h2>一信通特种设备作业人员考试系统</h2>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 这里是轮播详情内容 -->
      <div class="carousel-detail-container">
        <div class="back-link" @click="goBack">
          <el-icon><arrow-left /></el-icon> 返回
        </div>
        
        <div class="detail-content">
          <!-- 实际内容 -->
          <h2>{{ announcementTitle }}</h2>
          <div class="detail-info">
            <span class="publish-time">发布时间: {{ publishTime }}</span>
<!--            <span class="author">作者: {{ author }}</span>-->
          </div>
          <div class="content-text" v-html="content"></div>
          
          <!-- 添加底部区域 -->
          <div class="bottom-section">
            <!-- 这里可以添加新的内容 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import {decompressBase64, getAnnouncement} from '@/apis/common/announcement'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id)

// 公告详情数据
const announcementTitle = ref('加载中...')
const publishTime = ref('')
const author = ref('')
const content = ref('')

// 返回首页
const goBack = () => {
  router.go(-1)
}

// 根据ID获取公告详情
const fetchAnnouncementDetail = async (announcementId: string | string[]) => {
  try {
    // 通过id获取公告详情
    // console.log('获取公告详情，ID:', announcementId)
    const { data } = await getAnnouncement(announcementId)
    data.content = decompressBase64(data.content)
    announcementTitle.value = data.title
    content.value = data.content
    publishTime.value = data.createTime
    // 这里替换为你的实际API调用
    // const response = await getAnnouncementDetail(announcementId)
    
    // // 模拟数据
    // setTimeout(() => {
    //   announcementTitle.value = `公告标题 - ${announcementId}`
    //   publishTime.value = '2023-06-15'
    //   author.value = '系统管理员'
    //   content.value = `
    //     <p>这是公告 ${announcementId} 的详细内容...</p>
    //     <p>可以包含<strong>富文本</strong>格式的内容。</p>
    //     <ul>
    //       <li>列表项 1</li>
    //       <li>列表项 2</li>
    //       <li>列表项 3</li>
    //     </ul>
    //   `
    // }, 500)
    
  } catch (error) {
    console.error('获取公告详情失败:', error)
    announcementTitle.value = '获取公告失败'
    content.value = '无法加载公告内容，请稍后再试'
  }
}

// 在组件挂载时获取详细数据
onMounted(() => {
  fetchAnnouncementDetail(id.value)
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.nav-header {
  background: linear-gradient(90deg, rgb(var(--primary-6)), rgb(var(--success-6)));
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;

  .nav-content {
    width: 100%;
    padding: 0 24px;
    box-sizing: border-box;

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: flex-start;

      .logo {
        height: 36px;
        width: auto;
      }

      h2 {
        color: #fff;
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  padding: 24px;
  overflow-y: auto;
}

.carousel-detail-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: min-content;
  
  .back-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-color-primary);
    cursor: pointer;
    margin-bottom: 24px;
    font-size: 14px;
    flex-shrink: 0;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.detail-content {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  
  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .detail-info {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 24px;
    color: #666;
    font-size: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .content-text {
    height: fit-content;
    line-height: 1.8;
    color: #333;
    font-size: 16px;
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #eee;
    
    :deep(p) {
      margin-bottom: 16px;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 20px;
      margin-bottom: 16px;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    :deep(td), :deep(th) {
      border: 1px solid #ddd;
      padding: 8px;
    }
  }

  .bottom-section {
    min-height: 120px;
    padding: 24px 0;
  }
}
</style>