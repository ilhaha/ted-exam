<template>
  <div class="main-container">
    <a-row class="content-row" :gutter="12">
      <!-- 左侧个人信息和证书 -->
      <a-col :span="6">
        <div class="content-layout left-content">
          <button class="profile-score" @click="controlFrom()">成绩查询</button>
          <ProfileCard
              :user-info="userInfo"
              class="profile-section"
          />

          <SimpleCertificateList
            :certificate-list="certificateList" 
            @show-detail="showCertificateDetail"
            @view-all="handleViewAllCerts"
            class="cert-section"
          />
        </div>
      </a-col>

      <!-- 右侧主要内容 -->
      <a-col :span="18">
        <div class="content-layout right-content">
          <HomeLayout />
        </div>
      </a-col>
    </a-row>

    <!-- 详情抽屉 -->
    <a-drawer
      :title="drawerTitle"
      placement="bottom"
      :height="640"
      v-model:visible="visible"
      @close="onClose"
    >
      <template v-if="selectedType === 'certificate'">
        <div v-if="selectedItem" class="detail-container">
          <div class="detail-content">
            <div class="detail-left">
              <img :src="selectedItem.imageUrl" alt="证书图片" class="detail-image"/>
            </div>
            <div class="detail-info">
              <h2>{{ selectedItem.certificateTypeName }}</h2>
              <p>证书编号：{{ selectedItem.certificateNumber }}</p>
              <p>发证机构：{{"todo"}}</p>
              <p>获得时间：{{ selectedItem.holdingDate }}</p>
              <p>有效期至：{{ selectedItem.expiryDate }}</p>
              <p>证书说明：{{"todo"}}</p>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="selectedItem" class="detail-container">
          <div class="detail-content">
            <div class="detail-left">
              <img :src="selectedItem.imageUrl" alt="项目图片" class="detail-image"/>
            </div>
            <div class="detail-info">
              <h2>{{ selectedItem.projectName }}</h2>
              <p>项目角色：{{ selectedItem.role }}</p>
              <p>项目时间：{{ selectedItem.date }}</p>
              <p>项目编号：{{ selectedItem.projectNumber }}</p>
              <p>技术栈：{{ selectedItem.technologies }}</p>
              <p>项目职责：{{ selectedItem.responsibilities }}</p>
            </div>
          </div>
        </div>
      </template>
    </a-drawer>

    <a-modal
      v-model:visible="fromState"
      draggable
      :footer="false"
    >
      <template #title>
        成绩查询
      </template>
      <div>
        <a-form :model="form" :style="{ width: '450px' }" @submit="handleSubmit">
          <a-form-item label="账号名">
            <a-input v-model="form.username" placeholder="请输入账号名" />
          </a-form-item>
          <a-form-item label="准考证号">
            <a-input v-model="form.identity" placeholder="请输入准考证号" />
          </a-form-item>
          <a-form-item label="考试项目">
            <a-input v-model="form.subject" disabled />
          </a-form-item>
          <a-form-item label="考试成绩">
            <a-input v-model="form.score" disabled />
          </a-form-item>
          <a-form-item>
            <a-button style="margin-right: 5px" @click="controlFrom()">取消</a-button>
            <a-button type="primary" html-type="submit">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue'
import {Message} from '@arco-design/web-vue'
import {getStudentInfo, getStudentScore} from '@/apis/studentInfo/student'
import HomeLayout from './layout/index.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import SimpleCertificateList from '@/components/SimpleCertificateList.vue'

const visible = ref(false)
const selectedKey = ref(['certificates'])
const selectedType = ref('certificate')
const selectedItem = ref(null)
const drawerTitle = ref('')

// 证书列表数据
const certificateList = ref([])
// 添加一个获取数据的方法

// 定义接口匹配后端返回的数据结构


// 个人信息数据
const userInfo = ref({
  avatar: '/static/images/test.jpg',
  nickName: '',
  documentList: [] as string[]
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

const showCertificateDetail = (item) => {
  selectedType.value = 'certificate'
  selectedItem.value = item
  drawerTitle.value = '证书详情'
  visible.value = true
}

const showProjectDetail = (item) => {
  selectedType.value = 'project'
  selectedItem.value = item
  drawerTitle.value = '项目详情'
  visible.value = true
}

const onClose = () => {
  visible.value = false
}

const handleViewAllCerts = () => {
  // 可以跳转到证书全部列表页面或打开弹窗
  console.log('View all certificates')
}

// 默认隐藏
const fromState = ref(false)
const form = reactive({
  username: '',
  identity: '',
  subject: '',
  score: '',
})

// 切换表单隐藏显示
const controlFrom = () => {
  clearForm('', '')
  fromState.value = !fromState.value
}

// 提交表单数据，获取考生成绩
const handleSubmit = async (data) => {
  if (!data.values.username && !data.values.identity) {
    Message.error('账号名或准考证号不能为空')
  }
  const res = await getStudentScore(data.values.username, data.values.identity)
  if (!res.data) {
    clearForm(form.username, form.identity)
    Message.error('获取成绩失败，请检查姓名与准考证号')
  }
  Object.assign(form, {
    subject: res.data.key,
    score: res.data.value,
  })
}
// 清空表单
function clearForm(name, ident) {
  Object.assign(form, {
    username: name,
    identity: ident,
    subject: '',
    score: '',
  })
}
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

.profile-score {
  width: 100%;
  height: 30px;
  background-color: white;
  border: 0.1px solid var(--color-border-2);
  border-radius: 4px;
  transition: all 0.2s;
}

.profile-score:hover {
  background-color: var(--color-secondary-hover);
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

.scoreForm {
  background-color: white;
  z-index: 999;
  position: absolute;
  top: 50%;
  left: 50%;
  box-shadow: 0 0 10px 7px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  transform: translate(-50%, -80%);
  padding: 50px 40px 40px 20px;
}

.scoreForm button {
  margin-right: 5px;
}
</style>
