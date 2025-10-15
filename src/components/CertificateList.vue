<template>
  <div class="list-container">
    <!-- <div class="notice-bar">
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
    </div> -->
    <StatusTabs 
      :status-list="certificateStatus"
      @change="handleStatusChange"
    />
    <div class="list-wrapper">
      <div class="cert-list">
        <div class="cert-grid">
          <template v-if="filteredCertificates.length">
            <div v-for="cert in paginatedCertificates" 
                 :key="cert.id" 
                 class="cert-item"
                 @click="handleCertClick(cert)"
            >
              <a-card class="cert-card" :bordered="false">
                <div class="cert-left">
                  <div class="cert-status" :class="cert.certificateStatus">
                    {{ getStatusText(cert.certificateStatus) }}
                  </div>
                  <div class="cert-main">
                    <h3 class="cert-name">{{ cert.certificateTypeName }}</h3>
                    <div class="cert-info">
                      <span class="cert-issuer">发证机构：{{ "todo"}}</span>
                      <span class="cert-id">证书编号：{{ cert.certificateNumber }}</span>
                    </div>
                    <div class="cer t-dates">
                      <span>获得时间：{{ cert.holdingDate }}</span>
                      <span>到期时间：{{ cert.expiryDate }}</span>
                    </div>
                  </div>
                </div>
<!--                <div class="cert-right">-->
<!--                  <icon-right />-->
<!--                </div>-->
              </a-card>
            </div>
          </template>
          <div v-else class="empty-state">
            <a-empty>
              <template #image>
                <icon-file style="font-size: 48px; color: var(--color-text-3);" />
              </template>
              <template #description>
                {{ currentStatus === 'all' ? '暂无证书数据' : '暂无相关状态的证书' }}
              </template>
            </a-empty>
          </div>
        </div>
        <div class="pagination-wrapper">
          <a-pagination
            :total="filteredCertificates.length"
            :page-size="pageSize"
            v-model:current="currentPage"
            size="small"
            show-total
            show-jumper
            style="margin-bottom: 30px;"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconRight, IconFile, IconNotification } from '@arco-design/web-vue/es/icon'
import StatusTabs from './StatusTabs.vue'
import type {CandidateCertificateResp} from "@/apis/certificates/certificates";

const certificateStatus = [
  { label: '未持有', value: 0, icon: 'icon-check-circle' },
  { label: '持有未过期', value: 1, icon: 'icon-clock-circle' },
  { label: '已过期', value: 2, icon: 'icon-close-circle' }
]

const currentStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

const props = defineProps<{
  certificates: CandidateCertificateResp[]
}>()

const emit = defineEmits<{
  (e: 'select', cert: any): void
}>()

const filteredCertificates = computed(() => {
  if (currentStatus.value === 'all') {
    return props.certificates
  }
  return props.certificates.filter(cert => cert.certificateStatus === currentStatus.value)
})

const paginatedCertificates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCertificates.value.slice(start, end)
})

const handleStatusChange = (status: string) => {
  currentStatus.value = status
  currentPage.value = 1
}

const handleCertClick = (cert: any) => {
  emit('select', cert)
}

const getStatusText = (status: string) => {
  const statusMap = {
    0: '未持有',
    1: '持有未过期',
    2: '已过期',
  }
  return statusMap[status] || '未知'
}

// 添加公告数据
const notices = [
  '恭喜张三获得AWS认证解决方案架构师证书！',
  '新证书认证流程已更新，请查看最新指南',
  '下周二下午将举行证书答疑会'
]
</script>

<style scoped lang="scss">
.list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.list-wrapper {
  flex: 1;
  overflow: auto;
}

.cert-list {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.cert-item {
  width: 100%;
}

.cert-card {
  height: 100%;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
}

.cert-left {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cert-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  
  &.valid {
    background-color: rgba(var(--success-6), 0.9);
  }
  
  &.expired {
    background-color: rgba(var(--danger-6), 0.9);
  }
  
  &.pending {
    background-color: rgba(var(--warning-6), 0.9);
  }
}

.cert-main {
  .cert-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    margin: 0 0 8px 0;
  }

  .cert-info {
    display: flex;
    gap: 24px;
    margin-bottom: 8px;
    color: var(--color-text-2);
    font-size: 14px;
  }

  .cert-dates {
    display: flex;
    gap: 24px;
    color: var(--color-text-3);
    font-size: 13px;
  }
}

.cert-right {
  color: var(--color-text-3);
  font-size: 20px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.pagination-wrapper {
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.notice-bar {
  margin-bottom: 16px;
  padding: 8px 16px;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.notice-carousel {
  height: 32px;
}

.notice-item {
  display: flex;
  align-items: center;
  height: 32px;
  
  .notice-icon {
    color: rgb(var(--primary-6));
    margin-right: 8px;
    font-size: 16px;
  }

  .notice-text {
    color: var(--color-text-2);
    font-size: 14px;
  }
}
</style> 