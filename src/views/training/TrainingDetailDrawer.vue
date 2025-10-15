<template>
<a-drawer v-model:visible="visible" title="培训内容" :width="width >= 600 ? 600 : '100%'" :footer="false">
  
  <!-- 搜索框和添加章节按钮放在同一行 -->
  <div class="header-actions">
    <a-input-search
      v-model="searchText"
      placeholder="搜索章节或视频"
      style="width: 200px"
      @change="handleSearch"
    />
    <a-button type="primary" @click="addChapter" v-permission="['training:chapter:add']" >
      <IconPlus style="margin-right: 5px;" /> 添加章节
    </a-button>
  </div>

<a-tree 
  :data="filteredTreeData"
  :field-names="{ children: 'children', title: 'title' }"
  :load-more="loadMore"
  v-if="filteredTreeData && filteredTreeData.length > 0"
>
  <template #title="nodeData">
    <span>
      <icon-folder v-if="!nodeData.isLeaf" style="margin-right: 8px; color: #3370ff;" />
      <icon-video-camera v-else style="margin-right: 8px; color: #3370ff;" />
      <span v-html="highlightText(nodeData.title)"></span>
    </span>
  </template>
  <template #extra="nodeData">
    <template v-if="nodeData.isLeaf">
      <a-popconfirm 
        content="删除该视频?" 
        @ok="() => delVideo(nodeData)"
      >
       <IconDelete style="position: absolute; right: 6px; font-size: 15px; top: 10px; color: red;"
       v-permission="['training:video:delete']"/>    
      </a-popconfirm>

            <IconEdit style="position: absolute; right: 50px; font-size: 15px; top: 10px; color: #3370ff;"
        @click="() => updateVideo(nodeData)" v-permission="['training:video:update']"/>

     

      <IconPlayArrowFill style="position: absolute; right: 100px; font-size: 15px; top: 10px; color: #3370ff;"
        @click="() => playVideo(nodeData)" v-permission="['training:video:add']"/>
    </template>

    <template v-else>
      <a-popconfirm 
        content="删除该章节?" 
        @ok="() => deleteChapter(nodeData)"
      >
        <IconDelete 
          style="position: absolute; right: 6px; font-size: 15px; top: 10px; color: red;" 
          v-permission="['training:chapter:delete']"
        />
      </a-popconfirm>

      <IconEdit style="position: absolute; right: 50px; font-size: 15px; top: 10px; color: #3370ff;"
        @click="() => updateChapter(nodeData)" v-permission="['training:chapter:update']"/>

      <IconLiveBroadcast style="position: absolute; right: 100px; font-size: 15px; top: 10px; color: #3370ff;"
        @click="() => addVideo(nodeData)"  v-permission="['training:chapter:add']"/>

      <IconPlus style="position: absolute; right: 150px; font-size: 15px; top: 10px; color: #3370ff;"
        @click="() => addSubChapter(nodeData.id)" v-permission="['training:chapter:add']"/>
    </template>
  </template>
</a-tree>
    <a-empty v-else/>

</a-drawer>

<!-- 添加视频播放弹窗 -->
<a-modal
  v-model:visible="videoModalVisible"
  title="视频播放"
  :mask-closable="false"
  :footer="false"
  :width="1200"
  class="video-modal"
>
  <div class="video-container">
    <video
      v-if="currentVideoUrl"
      ref="videoRef"
      :src="currentVideoUrl"
      controls
      autoplay
      controlsList="nodownload"
      style="width: 100%;"
    >
      您的浏览器不支持 video 标签。
    </video>
    <div class="video-controls">
      <a-button type="primary" @click="toggleFullScreen">
        <template #icon>
          <icon-fullscreen-exit v-if="isFullScreen" />
          <icon-fullscreen v-else />
        </template>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </a-button>
    </div>
  </div>
</a-modal>

<ChapterAddModal ref="ChapterAddModalRef" @save-success="handleSaveSuccess" />
<VideoAddModal ref="VideoAddModalRef" @save-success="handleSaveSuccess" />
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type TrainingDetailResp, getTraining as getDetail, trainingContent } from '@/apis/training/training'
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import ChapterAddModal from '@/views/training/chapter/ChapterAddModal.vue'
import VideoAddModal from '@/views/video/VideoAddModal.vue'
import { type ChapterResp, type ChapterQuery,customizeDeleteChapter, exportChapter, listChapter } from '@/apis/training/chapter'
import { type VideoResp, type VideoQuery, deleteVideo, exportVideo, listVideo,customizeaDeleteVideo } from '@/apis/training/video'
import { IconFolder, IconVideoCamera, IconFullscreen, IconFullscreenExit } from '@arco-design/web-vue/es/icon'

const { width } = useWindowSize()
const dataId = ref('')
const dataDetail = ref<TrainingDetailResp>()
const visible = ref(false)
const trainTreeResp = ref([])
const searchText = ref('')

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// 添加视频播放相关的响应式变量
const videoModalVisible = ref(false)
const currentVideoUrl = ref('')
const videoRef = ref<HTMLVideoElement>()

// 添加全屏相关的状态
const isFullScreen = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await trainingContent({ 'tedTrainingId': dataId.value });
  trainTreeResp.value = data.chapters;
}

// 格式化树结构
const formattedTreeData = computed(() => {
  function formatTreeData(chapters) {
    return chapters.map((chapter) => {
      const children = chapter.children ? formatTreeData(chapter.children) : [];
      const videoNodes = (chapter.videos || []).map((video) => ({
        id: `${video.id}`,
        title: `${video.title} <span class="duration-tag">${video.durationStr}</span>`,
        isLeaf: true,
        chapterId:`${video.chapterId}`,
        videoPath:`${video.videoPath}`
      }));
      return {
        ...chapter,
        children: [...children, ...videoNodes],
      };
    });
  }
  return formatTreeData(trainTreeResp.value);
});

// 高亮显示匹配文本
const highlightText = (text: string) => {
  if (!searchText.value) return text
  const searchValue = searchText.value.toLowerCase()
  const index = text.toLowerCase().indexOf(searchValue)
  if (index < 0) return text
  
  const beforeStr = text.substring(0, index)
  const matchStr = text.substring(index, index + searchValue.length)
  const afterStr = text.substring(index + searchValue.length)
  
  return `${beforeStr}<span class="highlight-text">${matchStr}</span>${afterStr}`
}

// 优化搜索过滤逻辑
const filteredTreeData = computed(() => {
  if (!searchText.value) {
    return formattedTreeData.value
  }

  const searchValue = searchText.value.toLowerCase()

  function filterTree(nodes) {
    return nodes.filter(node => {
      // 检查当前节点标题是否匹配
      const titleMatch = node.title.toLowerCase().includes(searchValue)
      
      // 如果有子节点，递归过滤
      let filteredChildren = []
      if (node.children && node.children.length) {
        filteredChildren = filterTree(node.children)
      }
      
      // 如果当前节点匹配或者有匹配的子节点，则保留该节点
      if (titleMatch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          // 如果是因为子节点匹配而保留的父节点，展开它
          expanded: filteredChildren.length > 0
        }
      }
      
      return false
    })
  }

  return filterTree(formattedTreeData.value)
})

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

// 添加章节
const ChapterAddModalRef = ref<InstanceType<typeof ChapterAddModal>>()
const addChapter = () => {
  ChapterAddModalRef.value?.onAdd(dataId.value,0)
}
// 新增子章节
const addSubChapter = (id: string) => {
  ChapterAddModalRef.value?.onAdd(dataId.value,id)
}
// 修改章节
const updateChapter = (record: ChapterResp) => {
  ChapterAddModalRef.value?.onUpdate(record.id)
}
// 删除章节
const deleteChapter = async (record: ChapterResp) => {
  await customizeDeleteChapter(record.id)  
  getDataDetail() 
}
// 添加视频
const VideoAddModalRef = ref<InstanceType<typeof VideoAddModal>>()
const addVideo = (record: ChapterResp) => {
  VideoAddModalRef.value?.onAdd(record.trainingId,record.id)
}
// 修改视频
const updateVideo = (record: VideoResp) => {
  VideoAddModalRef.value?.onUpdate(record.id)
}
// 删除视频
const delVideo = async (record: VideoResp) => {
  await customizeaDeleteVideo(record.id, record.chapterId)
  getDataDetail()  // 刷新树形数据
  emit('refresh')  // 通知父组件刷新主表数据
}
// 修改播放视频方法
const playVideo = (nodeData: any) => {
  if (videoRef.value) {
    videoRef.value.pause()  // 确保之前的视频暂停
    videoRef.value.currentTime = 0  // 重置之前视频的播放进度
  }
  currentVideoUrl.value = nodeData.videoPath
  videoModalVisible.value = true
}

// 切换全屏方法
const toggleFullScreen = () => {
  const videoElement = videoRef.value
  if (!videoElement) return

  if (!isFullScreen.value) {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen()
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen()
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

// 监听全屏变化
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
})

const handleFullscreenChange = () => {
  isFullScreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
}

// 子组件执行成功，刷新树
const handleSaveSuccess = () => {
  getDataDetail()  // 刷新树形数据
  emit('refresh')  // 通知父组件刷新主表数据
}

// 处理搜索
const handleSearch = () => {
  // 清空搜索
  if (!searchText.value) {
    getDataDetail() // 重新加载原始数据
    return
  }
  
  // 如果搜索文本少于2个字符，不执行搜索
  if (searchText.value.length < 2) {
    return
  }
}

// 监听弹窗关闭事件，停止视频播放
watch(videoModalVisible, (newValue) => {
  if (!newValue && videoRef.value) {
    videoRef.value.pause()  // 暂停视频播放
    videoRef.value.currentTime = 0  // 重置播放进度
    currentVideoUrl.value = ''  // 清空视频地址
  }
})

defineExpose({ onOpen,handleSaveSuccess })
</script>

<style scoped lang="scss">
.header-actions {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: auto; /* Push actions to the right */
}

.highlight-text {
  color: #3370ff;
  font-weight: bold;
  background-color: rgba(51, 112, 255, 0.1);
  padding: 0 2px;
}

.duration-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1;
  border-radius: 10px;
  background-color: #e8f3ff;
  color: #3370ff;
  margin-left: 8px;
  font-weight: normal;
}

:deep(.arco-tree-node) {
  // 确保节点内容可以完整显示高亮文本
  white-space: normal;
  word-break: break-word;

  // 确保时长标签样式正确显示
  .duration-tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 1;
    border-radius: 10px;
    background-color: #e8f3ff;
    color: #3370ff;
    margin-left: 8px;
    font-weight: normal;
  }
}

.video-modal {
  :deep(.arco-modal-content) {
    padding: 0;
  }
}

.video-container {
  position: relative;
  width: 100%;
  background-color: #000;
  
  video {
    width: 100%;
    max-height: 70vh;
    display: block;
  }

  .video-controls {
    position: absolute;
    bottom: 60px;
    right: 20px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .video-controls {
    opacity: 1;
  }
}

// 全屏时的样式
:deep(video:fullscreen) {
  width: 100vw;
  height: 100vh;
  max-height: none;
}

:deep(video:-webkit-full-screen) {
  width: 100vw;
  height: 100vh;
  max-height: none;
}
</style>