<template>
  <div class="login-container">
    <!-- 顶部导航 -->
    <div class="nav-header">
      <div class="nav-content">
        <div class="logo-section">
          <img src="/logo.svg" alt="logo" class="logo" />
          <h2>一信通特种设备作业人员考试系统</h2>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <a-row class="content-wrapper">
        <!-- 左侧轮播和公告 -->
        <a-col :span="16" class="left-col">
          <div class="left-content">
            <div class="carousel-info-section">
              <div class="carousel-wrapper">
                <Carousel />
              </div>
              <div class="info-wrapper">
                <Info />
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧登录框 -->
        <a-col :span="8" class="right-col">
          <div class="right-content">
            <div class="login-box-wrapper">
              <Login />
            </div>
            <div v-show="showCertList" class="cert-list-wrapper">
              <div class="cert-list-title">最新证书获得者</div>
              <div class="cert-list">
                <div class="cert-scroll">
                  <div v-for="item in certList" :key="item.id" class="cert-item">
                    <div class="cert-info">
                      <span class="name">{{ item.name }}</span>
                      <span class="id-card">{{ formatIdCard(item.idCard) }}</span>
                      <span class="cert-name">{{ item.certName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="register">
      <Register />
    </div>
    <div class="forgotPassword">
      <ForgotPassword />
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import Login from './components/login/index.vue'
import Register from './components/register/index.vue'
import ForgotPassword from './components/forgotPassword/index.vue'
import Info from './components/info/index.vue'
import Carousel from '@/components/Carousel/index.vue'
import { forgotFormKey, loginFormKey } from '@/utils/inject-keys'

// 格式化身份证号，只显示前6位和后4位
const formatIdCard = (idCard: string) => {
  return idCard.replace(/^(.{6})\d+(.{4})$/, '$1****$2')
}

// 模拟证书获得者数据
const certList = [
  { id: 1, name: '张三', idCard: '110101199001011234', certName: '特种设备作业人员证' },
  { id: 2, name: '李四', idCard: '110101199001021234', certName: '压力容器操作证' },
  { id: 3, name: '王五', idCard: '110101199001031234', certName: '起重机操作证' },
  { id: 4, name: '赵六', idCard: '110101199001041234', certName: '电梯安装维修证' },
  { id: 5, name: '孙七', idCard: '110101199001051234', certName: '锅炉操作证' },
  // ... 可以添加更多数据
]

// 注册账号窗口
const loginWindow = ref(false)
provide(loginFormKey, loginWindow)

// 忘记密码窗口
const forgotWindow = ref(false)
provide(forgotFormKey, forgotWindow)

// 控制证书列表显示
const showCertList = ref(true)
provide('showCertList', showCertList)
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
}

.nav-header {
  background: linear-gradient(90deg, rgb(var(--primary-6)), rgb(var(--success-6)));
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;

  .nav-content {
    width: 100%; // 修改为100%宽度
    padding: 0 24px;
    box-sizing: border-box;

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: flex-start; // 确保内容靠左对齐

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
  padding: 24px 0;

  .content-wrapper {
    flex: 1;
    margin: 0;
    padding: 0;
    display: flex;
    width: 100%;
  }
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-col {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px); // 减去导航栏的高度
  padding-left: 24px;
}

.left-content {
  flex: 1;
  display: flex;
  height: 100%;
}

.carousel-info-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .carousel-wrapper {
    flex: 1.2; // 将轮播图比例从2改为1.2，使其占据更少的空间
    position: relative;
    min-height: 0;
    :deep(.el-carousel),
    :deep(.el-carousel__container) {
      height: 100% !important;
    }
  }

  .info-wrapper {
    flex: 1; // 保持公告区域比例不变
    overflow-y: auto;
    padding: 0 10px;
    margin-top: 20px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.right-col {
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: calc(100vh - 68px); // 设置总高度
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.login-box-wrapper {
  height: 420px; // 固定登录框高度
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin: 0 24px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  }
}

.cert-list-wrapper {
  flex: 1;
  height: 180px;
  min-height: 180px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin: 30px 24px 30px 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  position: relative;
  z-index: 1;

  .cert-list-title {
    font-size: 18px;
    font-weight: 600;
    color: #ff4d4f; // 使用红色
    margin-bottom: 16px;
    text-align: center; // 居中显示
    position: relative;
    padding-bottom: 10px; // 添加底部间距

    &::after { // 添加底部装饰线
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: #ff4d4f;
    }
  }

  .cert-list {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .cert-scroll {
    animation: scrollUp 20s linear infinite;
    &:hover {
      animation-play-state: paused;
    }
  }

  .cert-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-2);

    &:last-child {
      border-bottom: none;
    }

    .cert-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: var(--color-text-2);

      .name {
        flex: 1;
        font-weight: 500;
      }

      .id-card {
        flex: 2;
        color: var(--color-text-3);
      }

      .cert-name {
        flex: 2;
        color: var(--color-text-1);
      }
    }
  }
}

@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.content {
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 24px;
  min-height: 0;
  flex-direction: row-reverse;
}

// 响应式处理
@media screen and (max-width: 1200px) {
  .main-content {
    padding: 16px 0;
  }

  .right-col {
    padding-right: 16px;
  }

  .login-box-wrapper {
    margin: 0 16px;
  }
}

// 添加遮罩层样式
.login-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: none;
}

.login-container:has(.login-form[v-show="true"])::before {
  display: block;
}

.mask {
  height: 100%;
}
</style>
