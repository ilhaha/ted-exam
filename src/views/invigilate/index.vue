<template>
  <div class="main-container">
    <a-row class="content-row" :gutter="12">
      <!-- 左侧个人信息和证书 -->
      <a-col :span="6">
        <div class="content-layout left-content">
          <ProfileCard :user-info="userInfo" class="profile-section" />
        </div>
      </a-col>

      <!-- 右侧主要内容 -->
      <a-col :span="18">
        <div class="content-layout right-content">
          <HomeLayout />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getStudentInfo } from '@/apis/studentInfo/student'
import HomeLayout from './layout/index.vue'
import ProfileCard from '@/components/ProfileCard.vue'

const visible = ref(false)
const selectedKey = ref(['certificates'])
const selectedType = ref('certificate')
const selectedItem = ref(null)
const drawerTitle = ref('')


// 个人信息数据
const userInfo = ref({
  avatar: '/static/images/test.jpg',
  nickName: '',
})

const fetchUserInfo = async () => {
  try {
    const res = await getStudentInfo()
    console.log('API Response:', res) // 调试日志
    
    if (res?.data) { // 使用可选链操作符安全访问数据
      const userData = res.data
      userInfo.value = {
        ...userInfo.value,
        nickName: userData.nickName || '', // 提供默认值
        documentList: userData.documentList || []
      }
      console.log('Updated userInfo:', userInfo.value)
    }
  } catch (error) {
    Message.error('获取个人信息失败')
    console.error('获取个人信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.main-container {
  background: var(--color-fill-2);
  min-height: calc(100vh - 64px);
  padding: 8px;
}

.content-row {
  background: var(--color-fill-2);
  height: calc(100vh - 112px);
}

.content-layout {
  background: var(--color-bg-2);
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.left-content {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  .profile-section {
    flex: 1;
    overflow: auto;
  }

  .cert-section {
    flex-shrink: 0;
  }
}

.right-content {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.profile-card {
  background: var(--color-bg-2);
  border-radius: 8px;
  overflow: hidden;
}

.profile-header {
  text-align: center;
  padding: 20px 0;

  .profile-avatar {
    margin-bottom: 16px;
  }

  .profile-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }

  .profile-title {
    color: var(--color-text-3);
    font-size: 14px;
  }
}

.profile-info {
  padding: 0 16px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--color-text-2);
    font-size: 14px;

    :deep(.arco-icon) {
      font-size: 16px;
      color: var(--color-text-3);
    }
  }
}

.profile-skills {
  padding: 0 16px;

  h4 {
    color: var(--color-text-1);
    margin-bottom: 16px;
    font-size: 16px;
  }

  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-tag {
    margin-bottom: 8px;
  }
}

.detail-container {
  padding: 20px;
  background: var(--color-bg-2);
}

.detail-content {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-left {
  flex: 0 0 300px;
}

.detail-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-info {
  flex: 1;
  
  h2 {
    margin-bottom: 16px;
    color: var(--color-text-1);
  }
  
  p {
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--color-text-2);
    line-height: 1.6;
  }
}
</style>