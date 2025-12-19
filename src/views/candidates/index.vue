<template>
  <div class="user-info-container" v-show="!showVideo">
    <h2 class="main-title">确认信息并开始考试</h2>
    <div class="current-time">
      <span class="time-text">{{ now }}</span>
    </div>
    <a-row :gutter="{ md: 8, lg: 24, xl: 32 }">
      <a-col :span="24">
        <div class="info-card">
          <div class="card-content">
            <div class="left-section">
              <h2 class="card-title">个人信息</h2>
              <div class="user-profile">
                <div class="avatar-container">
                  <img :src="userStore.avatar" alt="用户头像" class="avatar">
                </div>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">姓名：</span>
                    <span class="value">{{ userStore.nickname }} </span>
                  </div>
                  <div class="info-item">
                    <span class="label">身份证号：</span>
                    <span class="value">{{ userStore.username }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">准考证号：</span>
                    <span class="value">{{ userStore.examNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">考试科目：</span>
                    <span class="value">{{ userStore.planName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">考试考场：</span>
                    <span class="value">{{ userStore.classroomName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">考试时间：</span>
                    <span class="value">{{ userStore.examTime }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="right-section">
              <h2 class="card-title">考试公告</h2>
              <div class="announcement-content">
                <div class="announcement-item">
                  <div class="announcement-title">考试须知</div>
                  <div class="announcement-text">
                    1. 考试时间为{{ userStore.examDuration }}分钟，请合理安排答题时间<br>
                    2. 考试期间请保持安静，遵守考场纪律
                  </div>
                </div>
                <div class="announcement-item">
                  <div class="announcement-title">注意事项</div>
                  <div class="announcement-text">
                    1. 考试系统出现异常请及时联系监考老师<br>
                    2. 【重要须知】考试作答时，严禁刷新页面、切换屏幕，违规将影响考试成绩<br>
                    3. 作答过程中请勿随意切换输入法或调整系统设置，防止页面卡顿<br>
                    4. 考试过程中若遇网络中断，请立即联系监考老师，切勿自行重启设备<br>
                    5. 禁止使用任何辅助软件、工具书或通讯设备，一经发现按作弊处理<br>
                    6. 交卷后请确认系统提示“提交成功”，再离开考场
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="button-container">
            <a-button class="confirm-button" @click="handleVideoButtonClick"
              v-if="!videoEnded && userStore.warningShortFilm">观看警示短片</a-button>
            <a-button v-if="videoEnded || !userStore.warningShortFilm" class="confirm-button"
              @click="startExam">进入考试</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
  <!-- 右上角退出按钮 -->
  <div class="top-right-exit">
    <a-button status="danger" @click="handleExit">
      <template #icon><icon-export /></template>
      退出
    </a-button>
  </div>
  <div v-show="showVideo" style="width:100%;">
    <video ref="plyrVideo" class="plyr-video" playsinline>
      <source :src="userStore.warningShortFilm" type="video/mp4" />
    </video>

  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores'
import { Message, Modal } from "@arco-design/web-vue";
import dayjs from 'dayjs'

import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const showVideo = ref(false)
const videoEnded = ref(false)


const plyrVideo = ref<HTMLVideoElement | null>(null)
let player: Plyr

const router = useRouter()

const startExam = async () => {
  // const [startStr] = userStore.examTime.split(' —— ')
  // const start = dayjs(startStr, 'YYYY年MM月DD日 HH:mm')
  // const nowTime = dayjs()

  // // 小于考试开始时间
  // if (nowTime.isBefore(start)) {
  //   Message.warning('考试尚未开始，请耐心等待')
  //   return
  // }

  // // 超过考试开始15分钟
  // if (nowTime.isAfter(start.add(15, 'minute'))) {
  //   Message.error('已超过考试开始15分钟，无法进入考试')
  //   return
  // }

  Modal.warning({
    title: '确认开始考试',
    content: '您确认要开始考试吗？开始后不可退出考试，否者成绩无效！',
    okButtonProps: { status: 'warning' },
    maskClosable: false,
    hideCancel: false, // 显示取消按钮
    onOk: () => {
      router.push({
        path: '/startExam'
      })
    },
    onCancel: () => {
    }
  })

}

const handleExit = () => {
  Modal.warning({
    title: '提示',
    content: '确定要退出考试系统吗？',
    hideCancel: false,
    closable: true,
    onBeforeOk: async () => {
      try {
        await userStore.logout()
        await router.replace('/login')
        return true
      } catch (error) {
        return false
      }
    },
  })
}


watch(showVideo, (visible) => {
  if (visible && plyrVideo.value) {
    player = new Plyr(plyrVideo.value, {
      controls: [],
      disableContextMenu: true,
    });

    player.on('ready', () => {
      player.play();
    });

    // 禁止暂停
    player.on('pause', () => {
      player.play();
    });

    player.on('ended', () => {
      showVideo.value = false;
      player.destroy();
      videoEnded.value = true;
    });
  } else {
    if (player) {
      player.destroy();
    }
  }
});
const userStore = useUserStore()



// 添加点击事件处理函数
const handleVideoButtonClick = () => {
  showVideo.value = true;
}

// const examDuration = computed(() => {
//   const [startStr, endStr] = userStore.examTime.split(' —— ')
//   const start = dayjs(startStr, 'YYYY年MM月DD日 HH:mm')
//   const end = dayjs(endStr, 'YYYY年MM月DD日 HH:mm')
//   const duration = end.diff(start, 'minute')
//   return `${duration} 分钟`
// })
const now = ref(dayjs().format('YYYY年MM月DD日 HH:mm'))
const timer = ref<number>()

onMounted(() => {
  setInterval(() => {
    now.value = dayjs().format('YYYY年MM月DD日 HH:mm')
  }, 36000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer.value)
})
</script>
<style scoped>
.top-right-exit {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 999;
}

.plyr-video {
  width: 100%;
  height: 100vh;
  object-fit: contain;
  background-color: black;
}

.user-info-container {
  padding: 24px;
  background-color: #f8f9fa;
}

.main-title {
  text-align: center;
  color: #1a73e8;
  font-size: 2.5rem;
  font-weight: 600;
}

.current-time {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 1.5rem;
  /* color: #1a73e8; */
  font-weight: bold;
  /* background-color: #e3f2fd; */
  /* padding: 8px 16px; */
  /* border-radius: 8px; */
  margin-bottom: 15px;
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); */
}

.clock-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  background-size: contain;
}

.time-text {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  position: relative;
  padding-bottom: 100px;
}

.card-content {
  display: flex;
  gap: 32px;
}

.left-section,
.right-section {
  flex: 1;
}

.button-container {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-button {
  font-size: 1.4rem;
  height: 50px;
  padding: 0 60px;
  background: white;
  border: 2px solid #1a73e8;
  color: #1a73e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: #f0f7ff;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.avatar-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-list {
  width: 100%;
}

.card-title {
  color: #1a73e8;
  font-size: 2rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8e8e8;
}

.info-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  width: 120px;
  font-weight: 500;
  font-size: 1.2rem;
}

.value {
  color: #333;
  flex: 1;
  font-size: 1.2rem;
}

.announcement-content {
  height: calc(100% - 50px);
  overflow-y: auto;
}

.announcement-item {
  margin-bottom: 24px;
}

.announcement-title {
  color: #1a73e8;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 1.4rem;
}

.announcement-text {
  color: #666;
  line-height: 1.8;
  font-size: 1.2rem;
}
</style>