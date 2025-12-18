<template>
  <div>
    <!-- ✅ 正常提交 -->
    <div class="submit-result-container" v-if="violationType === 0">
      <div class="card normal-card">
        <h1 class="title normal-title">🎉 答卷已提交成功</h1>

        <ul class="tips normal-tips">
          <li>📝 请前往监考员处确认答卷提交状态</li>
          <li>🚪 保持考场秩序，请勿喧哗或逗留</li>
          <li>🎒 检查随身物品是否携带完整</li>
          <li>💬 如对考试内容有异议，可通过正式渠道申诉</li>
        </ul>

        <div class="score-info normal-score">
          <p>💯 本次考试得分：<strong>{{ score }}</strong></p>
        </div>
      </div>
    </div>

    <!-- ⚠️ 违规提交 -->
    <div class="submit-result-container" v-else>
      <div class="card violation-card">
        <h1 class="title warning-title">⚠️ 答卷已提交（存在违规）</h1>

        <div class="violation-warning">
          {{ violationType == 1 ? "累计切换非考试窗口/应用达 3 次" : "未知违规内容" }}
        </div>

        <ul class="tips violation-tips">
          <li>📝 本次考试存在违规行为，成绩是否有效需人工复核</li>
          <li>📋 违规记录已保存，作为成绩处理依据</li>
          <li>💬 如有异议，可在规定时间内提出申诉</li>
        </ul>

        <div class="score-info pending">
          <p>💯 当前得分：<strong>{{ score }}</strong></p>
          <p class="remark">⚠️ 最终成绩以审核结果为准</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const violationType = Number(route.query.violationType) || 0;
const score = Number(route.query.score) || 0;

onMounted(() => {
  setTimeout(() => {
    userStore.logout();
    router.replace("/login");
  }, 3000);
});
</script>

<style scoped lang="scss">
// 全局样式变量
$spacing-base: 8px;
$normal-color: #34a853;
$warning-color: #fbbc05;
$danger-color: #ea4335;
$primary-color: #1a73e8;
$text-dark: #333;
$text-gray: #555;
$text-light: #888;
$card-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
$card-shadow-hover: 0 12px 32px rgba(0, 0, 0, 0.15);

// 基础容器样式
.submit-result-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc($spacing-base * 2);
  transition: background 0.3s ease;

  // 正常状态背景
  &:has(.normal-card) {
    background: linear-gradient(120deg, #f0f9ff 0%, #e6f7ff 100%);
  }

  // 违规状态背景
  &:has(.violation-card) {
    background: linear-gradient(120deg, #f0f9ff 0%, #e6f7ff 100%);
  }
}

// 卡片通用样式
.card {
  background: white;
  padding: calc($spacing-base * 5);
  border-radius: 20px;
  box-shadow: $card-shadow;
  text-align: center;
  max-width: 600px;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $card-shadow-hover;
    transform: translateY(-2px);
  }

  // 违规卡片边框
  &.violation-card {
    border: 1px solid $warning-color;
  }
}

// 标题样式
.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: calc($spacing-base * 3);
  animation: fadeInUp 0.8s ease;

  // 正常状态标题
  &.normal-title {
    background: linear-gradient(90deg, $normal-color, $primary-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  // 违规状态标题
  &.warning-title {
    color: $danger-color;
  }
}

// 违规提示文案
.violation-warning {
  padding: calc($spacing-base * 2);
  margin-bottom: calc($spacing-base * 3);
  background-color: rgba($warning-color, 0.1);
  color: $danger-color;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
}

// 提示列表样式
.tips {
  text-align: left;
  font-size: 1.1rem;
  line-height: 1.8;
  margin: 0 0 calc($spacing-base * 4) 0;
  padding-left: 0;
  list-style: none;

  li {
    margin-bottom: calc($spacing-base * 1.5);
    padding-left: calc($spacing-base * 3);
    position: relative;
    transition: all 0.2s ease;
    cursor: default;

    &::before {
      transition: transform 0.2s ease;
      position: absolute;
      left: 0;
    }

    &:hover {
      padding-left: calc($spacing-base * 3.5);

      &::before {
        transform: translateX(4px);
      }
    }
  }

  // 正常列表图标
  &.normal-tips {
    color: $text-gray;

    li::before {
      content: "👉";
    }

    li:hover {
      color: $primary-color;
    }
  }

  // 违规列表图标
  &.violation-tips {
    color: $text-gray;

    li::before {
      content: "⚠️";
    }

    li:hover {
      color: $danger-color;
    }
  }
}

// 分数信息样式
.score-info {
  margin-bottom: calc($spacing-base * 3);
  font-size: 1.1rem;
  color: $text-dark;

  strong {
    font-weight: 600;
  }

  // 正常状态分数颜色
  &.normal-score strong {
    color: $normal-color;
  }

  // 待审核分数颜色
  &.pending {
    strong {
      color: $warning-color;
    }

    .remark {
      margin-top: calc($spacing-base);
      font-size: 1rem;
      color: $text-light;
    }
  }
}

// 入场动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }

  .tips {
    font-size: 1rem;
  }

  .card {
    padding: calc($spacing-base * 4);
  }

  .violation-warning {
    font-size: 1rem;
  }
}
</style>