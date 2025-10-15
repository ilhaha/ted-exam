<template>
  <div class="submit-result-container">
    <div class="card">
      <h1 class="title">🎉 已成功提交答卷</h1>
      <ul class="tips">
        <li>📝 请前往监考员处确认答卷是否提交成功</li>
        <li>🚪 请保持考场秩序，不要喧哗或逗留</li>
        <li>🎒 请携带好个人随身物品，检查是否遗落</li>
        <li>💬 如对考试内容有异议，可通过正式渠道申诉</li>
      </ul>
      <div class="footer">感谢您的配合，祝您取得好成绩！</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores";

const router = useRouter();

const userStore = useUserStore();

onMounted(() => {
  setTimeout(() => {
    userStore.logout();
    router.replace("/login");
  }, 30000);
});
</script>

<style scoped lang="scss">
.submit-result-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.title {
  font-size: 2rem;
  color: #1a73e8;
  margin-bottom: 24px;
  font-weight: bold;
}

.tips {
  text-align: left;
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 24px;
  list-style: none;
  padding-left: 0;

  li {
    margin-bottom: 12px;
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: "👉";
      position: absolute;
      left: 0;
    }
  }
}

.footer {
  font-size: 1rem;
  color: #888;
  margin-top: 20px;
}
</style>