<template>
  <div class="gi_page">
    <a-row>
      <a-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1" :xxl="1" class="button-col">
        <a-button
          class="back-button"
          shape="circle"
          @click="handleBack"
        >
          <template #icon>
            <IconLeft />
          </template>
        </a-button>
      </a-col>
    </a-row>
    <a-row wrap :gutter="16" align="stretch">
      <a-col :xs="24" :sm="24" :md="10" :lg="10" :xl="7" :xxl="7">
        <LeftBox />
      </a-col>
      <a-col :xs="24" :sm="24" :md="14" :lg="14" :xl="17" :xxl="17">
        <div>
          <PasswordPolicy />
        </div>
        <div>
          <Certificates />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { IconLeft } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import LeftBox from './BasicInfo.vue'
import PasswordPolicy from './Security.vue'
import Certificates from './Certificates.vue'

defineOptions({ name: 'SettingProfile' })
const router = useRouter()
const handleBack = () => {
  router.go(-1)
}
</script>

<style scoped lang="scss">
.gi_page {
  background-color: var(--color-bg-1);
  padding: 16px;
}

.button-col {
  position: relative;
  padding: 0;
  z-index: 9;
}

.back-button {
  position: absolute;
  top: 8px;
  left: 10px;
  width: 30px;
  height: 30px;
  transition: all 0.3s;
  background-color: var(--color-bg-2);
  border: none;
  color: var(--color-text-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateX(-2px);
    background-color: var(--color-fill-3);
    color: rgb(var(--primary-6));
  }

  &:active {
    transform: translateX(0);
  }

  :deep(.arco-icon) {
    font-size: 18px;
  }
}
</style>
