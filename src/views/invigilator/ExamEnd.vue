<template>
  <div class="submit-result-container">
    <div class="card">
      <h1 class="title">✅ 考试已结束</h1>
      <ul class="tips">        
        <li>📁 若考生有异议，请引导其走正式申诉流程</li>
        <li>🎒 请携带好个人随身物品，检查是否遗落</li> 
      </ul>
      <div class="footer">
       感谢您的辛勤值守与细致监督！
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {  useUserStore } from '@/stores'

const router = useRouter()

const userStore = useUserStore()

onMounted(() => {
  setTimeout(() => {
    userStore.logout()
    router.replace('/login')
  }, 30000)
})
</script>

<style scoped lang="scss">
.submit-result-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.title {
  font-size: 2rem;
  color: #1a73e8;
  margin-bottom: 24px;
  font-weight: bold;
}

.tips {
  text-align: left;
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 24px;
  list-style: none;
  padding-left: 0;

  li {
    margin-bottom: 12px;
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: '👉';
      position: absolute;
      left: 0;
    }
  }
}

.footer {
  font-size: 1rem;
  color: #888;
  margin-top: 20px;
}
</style>