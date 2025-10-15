<template>
  <div class="container">
    <!-- 左侧（TreeView 章节目录） -->
    <div class="left" :style="{ width: `${leftWidth}px` }">
      <p>课程ID: {{ courseId }}</p>
      <div v-if="trainingDetail">
        <h3>{{ trainingDetail.title }}</h3>
        <div class="detail-info">
          <div v-if="treeData.length">
            <TreeView
              v-model:expanded-keys="expandedKeys"
              :data="treeData"
              :selected-key="selectedNodeKey"
              @select="handleSelect"
              @video-url="handleVideoUrl"
            />
          </div>
          <div v-else>
            <a-spin />
          </div>
        </div>
      </div>
    </div>

    <!-- 拖拽调整大小的条 -->
    <div class="resizer" @mousedown="startResize"></div>

    <!-- 右侧（视频播放窗口） -->
    <div class="right">
      <!--      <video ref="videoPlayer" :src="videoUrl" @timeupdate="handleTimeUpdate"></video> -->
      <!-- 视频播放器 -->
      <VideoPlayer
        v-if="videoId.value != 0"
        ref="videoPlayer"
        :src="videoSrc"
        :options="playerOptions"
        loop: false
        :volume="0.6"
        controls

        @timeupdate="timeupdateFun"
        @ended="handleVideoEnded"
        @play="playerReadied"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { VideoPlayer } from '@videojs-player/vue'
import {
  type TrainingDetailResp,
  ending,
  getStuTree,
  getTraining,
  start,
  updateStudyTimeRecord,
} from '@/apis/training/training'
import TreeView from '@/components/TreeView.vue'
import 'video.js/dist/video-js.css'
import { throttle } from 'lodash-es'

const videoSrc = ref('')
const route = useRoute()
const courseId = ref(route.params.id)
const trainingDetail = ref<TrainingDetailResp>()
const treeData = ref([])
const selectedNodeKey = ref('')
const expandedKeys = ref<Record<string, boolean>>({})
const leftWidth = ref(300) // 左侧默认宽度
const minWidth = 200 // 左侧最小宽度
const maxWidth = 800 // 左侧最大宽度
const videoId = ref(0)
const isResizing = ref(false)
const studyTime = ref(0) // 学习时长（秒）
const currentTime = ref(0) // 当前播放进度（秒）
const getTimeFlag = ref(false) // 是否获取当前视频播放进度
// 获取视频播放器的引用
const videoPlayer = ref<{
  player: any
  dispose: () => void
} | null>(null)

const selectedVideo = ref<{ url: string } | null>(null)
const selectedNode = ref(null)
const videoUrl = ref('')

const handleVideoUrl = (url) => {
  console.log('接收到的视频 URL:', url)
  videoUrl.value = url
}
const playerOptions = ref({
  autoplay: 'any',
  muted: false,
  loop: false,
  preload: 'auto',
  language: 'zh-CN',

  aspectRatio: '16:9',
  fluid: true,
  notSupportedMessage: '此视频暂无法播放，请稍后再试',
  controls: true,
  controlBar: {
    timeDivider: true,
    durationDisplay: true,
    remainingTimeDisplay: false,
    fullscreenToggle: true,
    currentTimeDisplay: true,
  },
})
const playerReadied = (player: any) => {
  console.log('✅ 播放器准备完成')

  console.log('player', player)
}

const timeupdateFun = throttle(async (e) => {
  const videoElement = e.target.querySelector('video')
  if (!videoElement) return

  // 精确到整数秒
  const current = Math.floor(videoElement.currentTime)

  // 过滤无效进度（0秒或与上次相同）
  if (current === 0 || current === currentTime.value) return

  currentTime.value = current

  try {
    await updateStudyTimeRecord({
      trainId: trainingDetail.value.id,
      studyTime: current,
      videoId: videoId.value,
    })
    console.log(`✅ 进度更新至 ${current}s`)
  } catch (error) {
    console.error('❌ 进度更新失败:', error)
  }
}, 5000) // 每5秒最多触发一次

const handleVideoEnded = async (e: any) => {
  console.log('视频播放结束，发送请求到后端')

  try {
    await ending({
      studyTime: currentTime.value,
      videoId: videoId.value, // 这里可以替换为实际的视频ID
    })
  } catch (e) {
    console.error('发送请求失败:', e)
  }
}

// // 定时更新学习时长和播放进度
// const sendProgress = async () => {
//   try {
//
//   } catch (error) {
//     console.error('发送学习进度失败:', error)
//   }
// }

// 发送学习进度

// 定时任务
let progressInterval: ReturnType<typeof setInterval>
const startSendingProgress = () => {
  progressInterval = setInterval(() => {
    // 获取播放进度
    getTimeFlag.value = true
    // 每10s获取一次当前播放的时长
    // studyTime.value += 10 // 假设每次发送时长增加 10 秒
  }, 10000)
}

onMounted(() => {
  fetchTrainingDetail()
  startSendingProgress()
})

onBeforeUnmount(() => {
  clearInterval(progressInterval)
})

const fetchTrainingDetail = async () => {
  try {
    const detail = await getTraining(courseId.value as string)
    const treeResp = await getStuTree({ tedTrainingId: courseId.value })
    trainingDetail.value = detail.data

    // 转换并设置树形数据
    const transformedData = transformChapterData(treeResp.data.chapters)

    treeData.value = transformedData
    initExpandedKeys(transformedData)
  } catch (error) {
    console.error('获取培训详情失败:', error)
  }
}

// 处理节点选择（点击某个视频）
const handleSelect = async (node) => {
  // 重置播放器
  if (videoPlayer.value?.player) {
    videoPlayer.value.player.dispose()
  }

  // 加载新视频
  videoId.value = node.videoData.id
  videoSrc.value = node.videoData.videoPath

  // 获取初始进度
  const { data } = await start({ videoId: videoId.value })

  // 监听播放器就绪事件
  const readyHandler = () => {
    if (videoPlayer.value?.player) {
      videoPlayer.value.player.currentTime(data.studyTime)
      videoPlayer.value.player.off('ready', readyHandler)
    }
  }

  videoPlayer.value?.player.on('ready', readyHandler)
}


// 组件卸载时清理
onBeforeUnmount(() => {
  if (videoPlayer.value?.player) {
    videoPlayer.value.player.dispose()
  }
})

// 转换章节数据为树形结构
const transformChapterData = (chapters) => {
  if (!chapters || !chapters.length) return []

  return chapters.map((chapter) => {
    const node = {
      title: chapter.title,
      key: chapter.id.toString(),
      isLeaf: false,
      children: [],
    }

    // 处理子章节
    if (chapter.children && chapter.children.length) {
      node.children = [...transformChapterData(chapter.children)]
    }

    // 处理视频
    if (chapter.videos && chapter.videos.length) {
      const videoNodes = chapter.videos.map((video) => ({
        title: `${video.title} (${Math.floor(video.duration / 60)}分钟)`,
        key: `video-${video.id}`,
        isLeaf: true,
        videoData: video, // 保存视频数据
      }))
      node.children.push(...videoNodes)
    }

    return node
  })
}

// 包装进度更新请求
const safeUpdateProgress = async (current: number) => {
  try {
    const resp = await updateStudyTimeRecord({
      studyTime: current,
      videoId: videoId.value
    })

    if (resp.code !== 200) {
      throw new Error(resp.message)
    }

    return resp.data
  } catch (error) {
    console.error('进度更新失败:', error)
    // 可添加重试逻辑
  }
}

// 初始化时展开所有节点
const initExpandedKeys = (nodes: any[]) => {
  nodes.forEach((node) => {
    if (!node.isLeaf) {
      expandedKeys.value[node.key] = true
      if (node.children?.length) {
        initExpandedKeys(node.children)
      }
    }
  })
}

// 拖拽调整大小
const startResize = (event) => {
  isResizing.value = true
  const startX = event.clientX
  const startWidth = leftWidth.value

  const onMouseMove = (moveEvent) => {
    if (!isResizing.value) return
    const newWidth = startWidth + (moveEvent.clientX - startX)
    if (newWidth > minWidth && newWidth < maxWidth) {
      leftWidth.value = newWidth
    }
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 视频播放器准备就绪时的回调
const onPlayerReady = () => {
  console.log('视频播放器已准备好')
  // 你可以在这里进一步获取播放器实例并执行相关操作
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  height: 100vh;
  gap: 4px;
}

.left {
  background: #f7f7f7;
  overflow-y: auto;
  border-right: 2px solid #ddd;
  transition: width 0.1s ease;
  min-height: 100vh;
  padding: 10px;
  padding-bottom: 20px; /* 底部留出空间，避免被内容覆盖 */
  margin-bottom: 0; /* 不使用 margin-bottom，以免影响布局 */
}

.resizer {
  width: 6px;
  cursor: ew-resize;
  background: #ccc;
  transition: background 0.2s;
}

.resizer:hover {
  background: #999;
}

.right {
  flex: 1;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.video-js {
  width: 80%;
  height: 80%;
  margin-bottom: 50px;

  .vjs-control-bar {
    background-color: rgba(0, 0, 0, 0.5);
    bottom: 0;
    width: 100%;
  }
}
</style>
