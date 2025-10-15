<template>
  <div class="notice-bar">
    <a-carousel
      class="notice-carousel"
      animation-name="fade"
      :auto-play="true"
      :show-arrow="false"
      indicator-position="never"
      :interval="3000"
    >
      <a-carousel-item v-for="(notice, index) in notices" :key="index">
        <div class="notice-item">
          <icon-notification class="notice-icon" />
          <span class="notice-text">{{ notice }}</span>
        </div>
      </a-carousel-item>
    </a-carousel>
  </div>
</template>

<script setup lang="ts">
import { IconNotification } from '@arco-design/web-vue/es/icon'

defineProps<{
  notices: string[]
}>()
</script>

<style scoped lang="scss">
.notice-bar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.notice-carousel {
  width: 100%;
}

.notice-item {
  display: flex;
  align-items: center;
  color: var(--color-text-2);
  font-size: 14px;
  
  .notice-icon {
    color: rgb(var(--primary-6));
    margin-right: 8px;
    font-size: 16px;
  }

  .notice-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style> 