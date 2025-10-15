<template>
  <a-layout-header class="header">
    <section class="fold-btn-wrapper">
      <h3 class="login-logo" @click="goHome">
        <img src="/logo.svg" alt="logo" />
      </h3>
    </section>
    <div class="header-content">
      <div class="system-title" @click="showCompanyInfo">
        一信通特种设备作业人员考试系统
      </div>
      <div class="header-right">
        <a-row justify="end" align="center">
          <HeaderRightBar></HeaderRightBar>
        </a-row>
      </div>
    </div>

    <!-- 公司信息抽屉 -->
    <!-- placement="bottom" -->
    <a-drawer
      :visible="visible"
      placement="top"
      :height="300"
      @cancel="hideDrawer"
      @ok="hideDrawer"
      :header="false"
      :footer="false"
      :mask-closable="true"
    >
      <div class="company-info">
        <div class="company-header">
          <h2>公司介绍</h2>
          <a-button class="close-btn" type="text" @click="hideDrawer">
            <icon-close />
          </a-button>
        </div>
        <div class="company-content">
          <div class="info-section">
            <h3>公司简介</h3>
            <p>深圳一信通科技有限公司成立于2022年，是一家专注于特种设备安全管理的高新技术企业。公司致力于为特种设备行业提供专业的信息化解决方案。</p>
          </div>
          <div class="info-section">
            <h3>联系方式</h3>
            <p>地址：广东省深圳市南山区数字文化产业基地西塔1206</p>
            <p>电话：0755-26918050</p>
            <p>邮箱：davy@onedt.cn</p>
          </div>
          <div class="info-section">
            <h3>版权信息</h3>
            <p>© 2025 深圳一信通科技有限公司 版权所有</p>
          </div>
        </div>
      </div>
    </a-drawer>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderRightBar from '../HeaderRightBar/index.vue'
import { IconClose } from '@arco-design/web-vue/es/icon'

defineOptions({ name: 'LayoutHeader' })

const router = useRouter()
const visible = ref(false)

const goHome = () => {
  router.push('/')
}

const showCompanyInfo = () => {
  visible.value = true
}

const hideDrawer = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 $padding;
  height: 56px;
  background: var(--color-bg-1);
  border-bottom: 1px solid var(--color-neutral-3);
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.system-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
  z-index: 1;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgb(var(--primary-6));
  }
}

.header-right {
  margin-left: auto;
}

.arco-dropdown-open .arco-icon-down {
  transform: rotate(180deg);
}

.header {
  display: flex;
  align-items: center;

  .header-right {
    flex: 1;
    overflow: hidden;
    margin-left: $padding;
  }

  .header-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-1);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.arco-layout-header {
  padding: 0 $padding;
  height: 56px;
  background: var(--color-bg-1);
  border-bottom: 1px solid var(--color-neutral-3);
}

.company-info {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .company-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      color: var(--color-text-1);
      margin: 0;
    }

    .close-btn {
      font-size: 20px;
      color: var(--color-text-2);
      
      &:hover {
        color: var(--color-text-1);
      }
    }
  }

  .company-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  .info-section {
    h3 {
      font-size: 16px;
      color: var(--color-text-1);
      margin: 0 0 16px 0;
    }

    p {
      color: var(--color-text-2);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 抽屉自定义样式
:deep(.arco-drawer-body) {
  padding: 0;
}

.fold-btn-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.login-logo {
  height: 100%;
  margin: 0;
  padding: 8px 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }

  img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }
}
</style>
