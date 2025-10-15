<template>
  <div class="tree-view">
    <div
      v-for="node in data"
      :key="node.key"
      class="tree-node"
    >
      <div 
        class="node-content"
        :class="{ 
          'is-selected': selectedKey === node.key,
          'is-leaf': node.isLeaf
        }"
      >
        <!-- 目录折叠按钮 -->
        <span 
          v-if="!node.isLeaf && node.children?.length" 
          class="expand-icon"
          @click.stop="toggleExpand(node)"
        >
          <icon-caret-right v-if="!expandedKeys[node.key]" />
          <icon-caret-down v-else />
        </span>
        <span v-else class="expand-icon-placeholder"></span>

        <!-- 图标和标题 -->
        <div 
          class="content-main"
          @click="handleNodeClick(node)"
        >
          <span class="icon">
            <icon-video-camera v-if="node.isLeaf" />
            <icon-folder v-else />
          </span>
          <span class="title">{{ node.title }}</span>
          <span v-if="node.isLeaf" class="progress">({{ node.videoData.learningPercentage }}%)</span>
        </div>
      </div>
      
      <!-- 子节点 -->
      <div 
        v-if="node.children?.length" 
        v-show="expandedKeys[node.key]"
        class="children"
      >
        <tree-view
          :data="node.children"
          :selected-key="selectedKey"
          :expanded-keys="expandedKeys"
          @select="$emit('select', $event)"
          @update:expanded-keys="updateExpandedKeys"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  IconVideoCamera, 
  IconFolder,
  IconCaretRight,
  IconCaretDown
} from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  data: Array<{
    key: string
    title: string
    learningPercentage: number
    isLeaf?: boolean
    children?: any[]
  }>
  selectedKey?: string
  expandedKeys?: Record<string, boolean>
}>()

const emit = defineEmits<{
  select: [node: any]
  'update:expanded-keys': [keys: Record<string, boolean>]
}>()

// 处理节点点击
const handleNodeClick = (node: any) => {
  if (node.isLeaf) {
    // 如果是视频节点，只触发选中
    emit('select', node)
  } else {
    // 如果是目录节点，触发折叠并选中
    toggleExpand(node)
    emit('select', node)
  }
}

// 处理折叠/展开
const toggleExpand = (node: any) => {
  if (node.isLeaf) return
  
  const newExpandedKeys = { 
    ...props.expandedKeys,
    [node.key]: !props.expandedKeys?.[node.key]
  }
  emit('update:expanded-keys', newExpandedKeys)
}

// 更新展开状态
const updateExpandedKeys = (keys: Record<string, boolean>) => {
  emit('update:expanded-keys', keys)
}
</script>

<style scoped lang="scss">
.tree-view {
  .tree-node {
    .node-content {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;

      .expand-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--color-text-3);

        &:hover {
          color: var(--color-text-1);
        }
      }

      .expand-icon-placeholder {
        width: 24px;
      }

      .content-main {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background-color: var(--color-fill-2);
        }

        .icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .title {
          flex: 1;
        }
      }

      &.is-selected .content-main {
        background-color: var(--color-primary-light-1);
        color: var(--color-primary);
      }
    }

    .children {
      padding-left: 24px;
    }
  }
}
</style> 