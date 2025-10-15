<template>
  <div class="status-tabs">
    <a-tabs v-model:activeKey="activeStatus" @change="handleStatusChange">
      <a-tab-pane key="all" title="全部" v-if="getRoleFlag() !== '2' ">
        <template #icon><icon-apps /></template>
      </a-tab-pane>
      <a-tab-pane 
        v-for="status in statusList" 
        :key="status.value" 
        :title="status.label"
      >
        <template #icon><component :is="status.icon" /></template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  IconApps,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle
} from '@arco-design/web-vue/es/icon'
import {getRoleFlag} from "@/utils/auth";

const props = defineProps<{
  statusList: Array<{
    label: string
    value: string
    icon: string
  }>
  defaultValue?: string
}>()




const emit = defineEmits<{
  (e: 'change', status: string): void
}>()

const activeStatus = ref(props.defaultValue)  

const handleStatusChange = (status: string) => {
  emit('change', status)
}
</script>

<style scoped lang="scss">
.status-tabs {
  margin-bottom: 16px;
  width: 100%;
  
  :deep(.arco-tabs-nav) {
    padding: 0;
  }
}
</style> 