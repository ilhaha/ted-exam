<template>
  <div class="simple-cert-list">
    <div class="cert-list-content">
      <a-button @click="viewAllCertificates">
        <span>查看全部证书</span>
        <IconArrowRight />
      </a-button>
      <div v-for="cert in certificateList.slice(0, 2)"
           :key="cert.id" 
           class="cert-item"
           @click="showCertDetail(cert)"
      >
        <div class="cert-thumbnail">
          <img 
            :src="cert.imageUrl || '/static/images/default-cert.jpg'" 
            :alt="cert.certificateTypeName"
            class="thumbnail-image"
          />
        </div>
        <div class="cert-details">
          <div class="main-row">
            <span class="cert-title">{{ cert.certificateTypeName }}</span>
            <span class="cert-number">
              证书编号：{{ cert.certificateNumber }}
            </span>
          </div>
          <div class="date-row">
            <span class="date-item">生效日期：{{ cert.holdingDate }}</span>
            <span class="separator">|</span>
            <span class="date-item">到期日期：{{ cert.expiryDate || '-' }}</span>
            <div class="cert-status">
              <a-tag 
                :color="cert.certificateStatus === 1 ? 'green' : 'red'"
                class="status-tag"
              >
                {{ cert.certificateStatus === 1 ? '有效' : '已过期' }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 证书详情抽屉 -->
    <a-drawer
      :visible="visible"
      placement="bottom"
      height="80%"
      @cancel="closeDrawer"
    >
      <template #title>
        <div class="drawer-title">
          <span class="title-text">{{ selectedCert?.certificateTypeName }}</span>
          <a-tag 
            :color="selectedCert?.certificateStatus === 1 ? 'green' : 'red'"
            class="status-tag"
          >
            {{ selectedCert?.certificateStatus === 1 ? '有效' : '已过期' }}
          </a-tag>
        </div>
      </template>

      <div class="cert-detail-content" v-if="selectedCert">
        <div class="detail-image">
          <img 
            :src="selectedCert.imageUrl || '/static/images/default-cert.jpg'" 
            :alt="selectedCert.certificateTypeName"
          />
        </div>
        <div class="detail-info">
          <div class="info-item">
            <span class="label">证书编号：</span>
            <span class="value">{{ selectedCert.certificateNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">生效日期：</span>
            <span class="value">{{ selectedCert.holdingDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">到期日期：</span>
            <span class="value">{{ selectedCert.expiryDate || '-' }}</span>
          </div>
          <!-- 可以添加更多证书信息字段 -->
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserCertificate } from '@/apis/certificates/certificates'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const certificateList = ref([])
const loading = ref(false)
const visible = ref(false)
const selectedCert = ref(null)

// 获取用户证书列表
const fetchUserCertificates = async () => {
  loading.value = true
  try {
    const response = await getUserCertificate()
    console.log('用户证书数据：', response)

    if (response?.data) {
      certificateList.value = response.data || []
    }
  } catch (error) {
    console.error('获取证书列表失败：', error)
    Message.error('获取证书列表失败')
    certificateList.value = []
  } finally {
    loading.value = false
  }
}

// 查看全部证书
const viewAllCertificates = () => {
  router.push('/setting/profile')
}

const showCertDetail = (cert) => {
  selectedCert.value = cert
  visible.value = true
}

const closeDrawer = () => {
  visible.value = false
  selectedCert.value = null
}

onMounted(() => {
  fetchUserCertificates()
})
</script>

<style scoped lang="scss">
.simple-cert-list {
  .cert-list-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cert-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-bg-2);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    align-items: center;
    min-height: 76px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .cert-thumbnail {
    flex-shrink: 0;
    width: 60px;
    height: 45px;
    overflow: hidden;
    border-radius: 8px;
    background-color: var(--color-fill-3);
    
    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .cert-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .main-row {
    display: flex;
    align-items: center;
    gap: 16px;
    white-space: nowrap;
    overflow: hidden;
    line-height: 22px;

    .cert-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
      flex-shrink: 0;
    }

    .cert-number {
      font-size: 13px;
      color: var(--color-text-2);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .date-row {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--color-text-2);
    white-space: nowrap;
    line-height: 22px;

    .date-item {
      flex-shrink: 0;
    }

    .separator {
      margin: 0 8px;
      color: var(--color-text-3);
      flex-shrink: 0;
    }

    .cert-status {
      margin-left: auto;
      flex-shrink: 0;
      
      .status-tag {
        font-size: 13px;
        padding: 0 8px;
        height: 24px;
        line-height: 24px;
      }
    }
  }
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;

  .title-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .status-tag {
    font-size: 14px;
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
  }
}

.cert-detail-content {
  padding: 16px 0;

  .detail-image {
    width: 100%;
    height: 240px;
    overflow: hidden;
    border-radius: 4px;
    background-color: var(--color-fill-2);
    margin-bottom: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .detail-info {
    .info-item {
      margin-bottom: 16px;
      font-size: 15px;

      .label {
        color: var(--color-text-3);
        margin-right: 8px;
        min-width: 80px;
        display: inline-block;
      }

      .value {
        color: var(--color-text-1);
      }
    }
  }
}
</style> 