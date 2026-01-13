<template>
  <div v-if="examPaper.questions.length === 0" class="empty-wrapper">
    <a-empty description="试卷未生成">
    </a-empty>
    <div class="extra-tip">
      如已通知监考员生成试卷，请稍后点击<a-link @click="initTopicList">刷新</a-link>重试
    </div>
  </div>
  <div class="exam-container" v-else>
    <div id="exam-header">
      <div class="exam-info">
        <span class="exam-title">特种设备作业人员考试</span>
        <div class="exam-stats">
          <span class="exam-time">剩余时间：<span class="time-count">{{ timeLeft }}</span></span>
          <span class="stat-divider">|</span>
          <span class="stat-item">已答：<span class="stat-value">{{ answeredQuestions.length }}</span>题</span>
          <span class="stat-divider">|</span>
          <span class="stat-item">未答：<span class="stat-value">{{
            examPaper.topicNumber - answeredQuestions.length
              }}</span>题</span>
        </div>
      </div>
    </div>

    <div class="exam-content">
      <div class="question-section">
        <div id="question-navigation">
          <button class="nav-btn prev" :disabled="currentQuestion === 1" @click="jumpToQuestion(currentQuestion - 1)">
            <span class="btn-icon">←</span>
            <span class="btn-text">上一题</span>
          </button>
          <div class="question-header">
            <span class="question-number">第{{ currentQuestion }}题</span>
            <span class="question-type">{{
              examPaper.questions[currentQuestion - 1].questionType == 0
                ? "单选题"
                : examPaper.questions[currentQuestion - 1].questionType == 1
                  ? "判断题"
                  : "多选题"
            }}</span>
          </div>
          <button class="nav-btn next" :disabled="currentQuestion === examPaper.topicNumber"
            @click="jumpToQuestion(currentQuestion + 1)">
            <span class="btn-text">下一题</span>
            <span class="btn-icon">→</span>
          </button>
        </div>
        <div id="question-text">
          {{ examPaper.questions[currentQuestion - 1].question }}
        </div>
        <div class="question-attachment" v-if="examPaper.questions[currentQuestion - 1].attachment">
          <a-image :src="examPaper.questions[currentQuestion - 1].attachment" class="attachment-image" alt="题目附件"
            height="100px">
          </a-image>
        </div>
        <div id="options-container">
          <div class="option-item" v-for="(option, index) in examPaper.questions[currentQuestion - 1]
            .options" :key="option.id" @click="
              selectOption(examPaper.questions[currentQuestion - 1], index)
              " :class="{
                selected: isOptionSelected(
                  examPaper.questions[currentQuestion - 1].options[index].id
                ),
              }" :style="{ cursor: 'pointer' }">
            <span class="option-label">{{ optionLabels[index] }}</span>
            <span class="option-text">{{ option.question }}</span>
          </div>
        </div>
      </div>
      <div class="answer-sheet">
        <div class="sheet-header">答题卡</div>
        <div class="sheet-footer">
          <div class="legend">
            <div class="legend-item">
              <span class="dot current"></span>
              <span>当前题</span>
            </div>
            <div class="legend-item">
              <span class="dot answered"></span>
              <span>已答题</span>
            </div>
            <div class="legend-item">
              <span class="dot make"></span>
              <span>标记</span>
            </div>
            <div class="legend-item">
              <span class="dot"></span>
              <span>未答题</span>
            </div>
          </div>
        </div>
        <div class="sheet-content">
          <div class="question-grid">
            <div v-for="i in examPaper.topicNumber" :key="i" class="question-cell" :class="{
              answered: answeredQuestions.includes(i),
              current: currentQuestion === i,
              make: markedQuestions.includes(i),
            }" @click="jumpToQuestion(i)">
              {{ i }}
            </div>
          </div>
          <div style="margin-top: 30px; text-align: right;">
            <a-button type="dashed" status="danger" @click="mark">标记 / 取消</a-button>
          </div>
        </div>
        <div class="sheet-footer">
          <div class="submit-section">
            <a-button type="primary" size="large" @click="submitExam" :loading="submitExamLodding"
              :disabled="!canSubmitExam">交卷</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores";
import { getExamQuestionBank } from "@/apis/questionBank/index";
import { addRecord } from "@/apis/examRecords/index";
import { upload } from '@/apis/file/index'

import dayjs from "dayjs";
const router = useRouter();

const userStore = useUserStore();

const examPaper = ref<any>({
  questions: [],
  topicNumber: 0,
});
const submitExamLodding = ref(false)
const currentQuestion = ref(1);
const answeredQuestions = ref<number[]>([]);
const timeLeft = ref("");
const timer = ref<number>();
const violationScreenshots = ref<string[]>([]);

let startTime = dayjs();

const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
const markedQuestions = ref<number[]>([]);

const mark = () => {
  const q = currentQuestion.value;

  if (markedQuestions.value.includes(q)) {
    // 取消标记
    markedQuestions.value = markedQuestions.value.filter(i => i !== q);
  } else {
    // 添加标记
    markedQuestions.value.push(q);
  }
};


const updateTime = () => {
  // 考试总时长（分钟）
  const duration = userStore.examDuration;

  // 计算结束时间
  const end = startTime.add(duration, "minute");
  const now = dayjs();
  const diff = end.diff(now, "second");

  if (diff <= 0) {
    timeLeft.value = "00:00";
    clearInterval(timer.value);
    Message.warning("考试时间已到，正在自动提交试卷...");
    setTimeout(() => {
      submitPaper(0);
    }, 3000);
    return;
  }

  const minutes = Math.floor(diff / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (diff % 60).toString().padStart(2, "0");

  timeLeft.value = `${minutes}:${seconds}`;
};


const initTopicList = async () => {
  const res = await getExamQuestionBank(userStore.planId, userStore.userInfo.id);
  examPaper.value = res.data;
  if (examPaper.value) {
    // 修改考生考生状态
    return;
  }
};

const jumpToQuestion = (index: number) => {
  currentQuestion.value = index;
  // 减去 图片高度100px + 图片下外边距10px
  setHeight(
    examPaper.value.questions[currentQuestion.value - 1].attachment ? 110 : 0
  );
};

// 判断当前选项是否已被选中（用于多选高亮）
const isOptionSelected = (label: string) => {
  const question = examPaper.value.questions[currentQuestion.value - 1];
  return question.userAnswer?.includes(label);
};

// 选项点击处理
const selectOption = (question: any, index: number) => {
  const optionId =
    examPaper.value.questions[currentQuestion.value - 1].options[index].id;
  if (!question.userAnswer) {
    question.userAnswer = [];
  }

  if (question.questionType === 2) {
    // 多选题：切换选中状态
    if (question.userAnswer.includes(optionId)) {
      question.userAnswer = question.userAnswer.filter(
        (v: string) => v !== optionId
      );
    } else {
      question.userAnswer.push(optionId);
    }
  } else {
    // 单选 / 判断题
    question.userAnswer = [optionId];
  }

  if (!answeredQuestions.value.includes(currentQuestion.value)) {
    answeredQuestions.value.push(currentQuestion.value);
  }
};

const hasSubmitted = ref(false);

const submitPaper = async (violationType: number) => {
  if (hasSubmitted.value) return;
  try {
    submitExamLodding.value = true
    hasSubmitted.value = true;
    let totalScore = 0;

    for (let i = 0; i < examPaper.value.questions.length; i++) {
      const question = examPaper.value.questions[i];

      if (question.questionType === 0 || question.questionType === 1) {
        // 单选题或判断题
        const selectedId = question.userAnswer?.[0];
        const selectedOption = question.options.find(
          (opt) => opt.id === selectedId
        );
        if (selectedOption?.isCorrectAnswer) {
          totalScore += 1;
        }
      } else if (question.questionType === 2) {
        // 多选题
        const correctOptionIds = question.options
          .filter((opt) => opt.isCorrectAnswer)
          .map((opt) => opt.id)
          .sort();

        const selectedOptionIds = (question.userAnswer || []).slice().sort();

        const isCorrect =
          correctOptionIds.length === selectedOptionIds.length &&
          correctOptionIds.every((id, index) => id === selectedOptionIds[index]);

        if (isCorrect) {
          totalScore += 1;
        }
      }
    }
    await addRecord({
      planId: userStore.planId,
      candidateId: userStore.userInfo.id,
      registrationProgress: 3,
      examScores: totalScore,
      reviewStatus: 0,
      examPaper: JSON.stringify(examPaper.value),
      violationType: violationType,
      violationScreenshots: violationType == 0 ? [] : violationScreenshots.value
    });

    userStore.resetProctorCount()
    await router.push({
      path: "/examEnd",
      query: {
        violationType: violationType,
        score: totalScore
      }
    });
  } finally {
    submitExamLodding.value = false
  }

};
const unFinishedMarkedCount = computed(() => {
  return markedQuestions.value.length;
});
const unAnsweredCount = computed(() => {
  return examPaper.value.questions.filter(
    q => !q.userAnswer || q.userAnswer.length === 0
  ).length;
});

const canSubmitExam = computed(() => {
  return (
    unFinishedMarkedCount.value === 0 &&
    unAnsweredCount.value === 0
  );
});


const submitExam = () => {
  if (unFinishedMarkedCount.value > 0) {
    Message.warning(
      `您还有 ${unFinishedMarkedCount.value} 道标记题未完成，建议先完成后再提交`
    );
    return;
  }

  if (unAnsweredCount.value > 0) {
    Message.warning(
      `还有 ${unAnsweredCount.value} 道题未作答，请完成后再提交`
    );
    return;
  }
  Modal.warning({
    title: "确认提交",
    content: "您确认要提交试卷吗？提交后不能修改！",
    okButtonProps: { status: "warning" },
    maskClosable: false,
    hideCancel: false, // 显示取消按钮
    onOk: () => {
      submitPaper(0);
      clearInterval(timer.value);
    },
    onCancel: () => { },
  });
};

// 处理主进程发送的截图数据
const onScreenCaptured = async (_event, screenshots) => {
  for (const item of screenshots) {
    const formData = new FormData();
    const file = base64ToFile(item.base64, item.name);
    formData.append('file', file, item.name);
    formData.append('type', 'pic');

    const res = await upload(formData);
    violationScreenshots.value.push(res.data.url);
  }

  // 增加违规次数
  userStore.incrementProctorCount();
  const count = userStore.userInfo.proctorCount;

  if (count < 3) {
    Message.warning(`诚信考试提醒：检测到切屏操作，请遵守考试纪律，诚信作答。`);
    return;
  }
  // 超限处理
  Message.error("考试违规提醒：切屏次数已超出限制，系统将自动提交答卷并记录本次违规行为。")
  clearInterval(timer.value);
  submitPaper(1);
};


// 系统监考
const startInvigilating = () => {
  if (!userStore.enableProctorWarning) return;

  // 先判断 electronAPI 是否存在
  const electronAPI = window.electronAPI;
  if (!electronAPI) return;

  // 移除旧的监听，安全调用
  electronAPI.removeAllListeners?.('screen-captured');

  // 开启切屏截图
  electronAPI.send?.('enable-screen-monitor');

  // 添加新的监听
  electronAPI.on?.('screen-captured', onScreenCaptured);
};


onMounted(async () => {
  startInvigilating();
  await initTopicList();
  // 1. 用户进入页面的当前时间作为考试开始时间
  startTime = dayjs();
  // 3. 开始倒计时
  updateTime();
  timer.value = setInterval(updateTime, 1000);
  setHeight(0);
});

onUnmounted(() => {
  if (!userStore.enableProctorWarning) return;

  const electronAPI = window.electronAPI;
  if (!electronAPI) return;
  // 关闭切屏截图
  window.electronAPI.send('disable-screen-monitor');
  window.electronAPI.removeAllListeners?.('screen-captured');
  userStore.resetProctorCount();
});

// 将图片base64转成文件上传
const base64ToFile = (base64: string, filename: string): File => {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], filename, { type: 'image/png' });
};


const setHeight = (imageHeight) => {
  const main = document.getElementById("options-container");
  if (!main) return;
  const header = document.getElementById("exam-header");
  const navigation = document.getElementById("question-navigation");
  const questionText = document.getElementById("question-text");

  const allHeight =
    document.documentElement.scrollHeight || document.body.scrollHeight;
  const paddingAndMargin = 150;
  const headerHeight = header?.clientHeight || 0;
  const navigationHeight = navigation?.clientHeight || 0;
  const questionTextHeight = questionText?.clientHeight || 0;

  // 计算剩余高度
  const height =
    allHeight -
    headerHeight -
    navigationHeight -
    questionTextHeight -
    paddingAndMargin -
    imageHeight;

  // 设置 main 元素的高度
  main.style.height = `${height}px`;
};
</script>

<style scoped>
.empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
  text-align: center;
}

.extra-tip {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

.loading-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

.option-item.selected {
  background-color: #e6f7ff;
  border: 1px solid #1890ff;
}

.exam-container {
  background-color: #f5f7fa;
  padding: 20px;
}

#exam-header {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.exam-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-title {
  font-size: 1.5rem;
  color: #1a73e8;
  font-weight: 600;
}

.exam-time {
  font-size: 1.2rem;
  color: #666;
}

.time-count {
  color: #ff4d4f;
  font-weight: 600;
}

.exam-content {
  display: flex;
  gap: 20px;
}

.user-info-section {
  width: 300px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-list {
  width: 100%;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  line-height: 1.5;
}

.info-label {
  width: 120px;
  color: #666;
  font-size: 1.2rem;
}

.info-value {
  flex: 1;
  color: #333;
  font-size: 1.2rem;
  font-weight: 500;
}

.question-section {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

#question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f7ff;
  border: 1px solid #1a73e8;
  border-radius: 4px;
  color: #1a73e8;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #1a73e8;
  color: white;
}

.nav-btn:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.question-header {
  margin-bottom: 0;
}

.question-number {
  font-size: 1.4rem;
  color: #1a73e8;
  font-weight: 600;
  margin-right: 10px;
}

.question-type {
  color: #666;
  font-size: 1.1rem;
}

#question-text {
  font-size: 1.3rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
}

#options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 550px;
  overflow-y: auto;
}

.option-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  background: #f0f7ff;
  border-color: #1a73e8;
}

.option-item.selected {
  background: #e6f7ff;
  border-color: #1a73e8;
}

.option-label {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: 600;
}

.option-item.selected .option-label {
  background: #1a73e8;
  color: white;
}

.option-item.correct {
  background: #f6ffed;
  border-color: #52c41a;
}

.option-item.wrong {
  background: #fff1f0;
  border-color: #ff4d4f;
}

.answer-feedback {
  position: absolute;
  right: 20px;
  font-size: 1.4rem;
  font-weight: bold;
}

.answer-feedback.correct {
  color: #52c41a;
}

.answer-feedback.wrong {
  color: #ff4d4f;
}

.option-item.correct .option-label {
  background: #52c41a;
  color: white;
}

.option-item.wrong .option-label {
  background: #ff4d4f;
  color: white;
}

.answer-sheet {
  /* width: 300px; */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sheet-header {
  padding: 15px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a73e8;
}

.sheet-content {
  padding: 15px;
  flex: 1;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
}

.question-cell {
  width: 40px;
  height: 40px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-cell:hover {
  background: #f0f7ff;
  border-color: #1a73e8;
}

.question-cell.current {
  background: #1a73e8;
  color: black;
  border-color: #1a73e8;
}

.question-cell.answered {
  background: #e6f7ff;
  border-color: #1a73e8;
}

.question-cell.make {
  background: #e6f7ff;
  border-color: #fadb14;
}

.sheet-footer {
  padding: 15px;
  border-top: 1px solid #e8e8e8;
}

.question-attachment {
  margin-bottom: 10px;
}

.legend {
  display: flex;
  gap: 15px;
  /* margin-bottom: 15px; */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #e8e8e8;
}

.dot.current {
  background: #1a73e8;
  border-color: #1a73e8;
}

.dot.make {
  background: #fadb14;
  border-color: #fadb14;
}

.dot.answered {
  background: #e6f7ff;
  border-color: #1a73e8;
}

.submit-section {
  text-align: center;
}

.submit-btn {
  padding: 10px 30px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #096dd9;
  transform: translateY(-2px);
}

.exam-stats {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-divider {
  color: #e8e8e8;
  font-size: 1.2rem;
}

.stat-item {
  font-size: 1.2rem;
  color: #666;
}

.stat-value {
  color: #1a73e8;
  font-weight: 600;
  margin: 0 2px;
}

.explanation-section {
  margin-top: 30px;
  padding: 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}

.explanation-title {
  font-size: 1.2rem;
  color: #d48806;
  font-weight: 600;
  margin-bottom: 10px;
}

.explanation-content {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}
</style>
