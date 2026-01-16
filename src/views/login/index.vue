<template>
  <div v-if="isDesktop" class="login pc">
    <h3 class="login-logo">
      <img v-if="logo" src="../../../public/logo.png" alt="logo" />
      <img v-else src="../../../public/logo.png" />
      <span>{{ title }}</span>
    </h3>
    <a-row align="stretch" class="login-box">
      <a-col :xs="0" :sm="12" :md="13">
        <div class="login-left">
          <h4>欢迎参加本次考试</h4>
          <p>请使用身份证登录考试系统，选择本场考试的准考证开始考试。</p>
          <ul>
            <li>身份验证入场，杜绝替考，保障考试公平</li>
            <li>实时监控考试状态，全程防作弊护航</li>
            <li>答题进度自动保存，意外中断不丢失作答内容</li>
            <li>考试时长倒计时提醒，合理分配答题时间</li>
            <li>交卷后即时出分，清晰知晓考试结果</li>
          </ul>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="11">
        <div class="login-right">
          <a-tabs v-model:activeKey="activeTab" class="login-right__form">
            <a-tab-pane key="1" title="考生登录">
              <component :is="AccountLogin" v-if="activeTab === '1'" />
            </a-tab-pane>
            <!-- <a-tab-pane key="2" title="监考员登录">
              <component :is="InvigilatorAccountLogin" v-if="activeTab === '2'" />
            </a-tab-pane> -->
          </a-tabs>
        </div>
      </a-col>
    </a-row>


    <GiThemeBtn class="theme-btn" />
    <Background />

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Background from './components/background/index.vue'
import AccountLogin from './components/account/index.vue'
// import InvigilatorAccountLogin from './components/invigilator/index.vue'
import { socialAuth } from '@/apis/auth'
import { useAppStore } from '@/stores'
import { useDevice } from '@/hooks'
import { onMounted } from 'vue'

defineOptions({ name: 'Login' })

const { isDesktop } = useDevice()
const appStore = useAppStore()
const title = computed(() => appStore.getTitle())
const logo = computed(() => appStore.getLogo())

const isEmailLogin = ref(false)
const activeTab = ref('1')
// 切换登录模式
const toggleLoginMode = () => {
  isEmailLogin.value = !isEmailLogin.value
}

// 第三方登录授权
const onOauth = async (source: string) => {
  const { data } = await socialAuth(source)
  window.location.href = data.authorizeUrl
}
</script>

<style scoped lang="scss">
@media screen and (max-width: 570px) {
  .pc {
    display: none !important;
    background-color: white !important;
  }

  .login {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    background-color: var(--color-bg-5);
    color: #121314;

    &-logo {
      width: 100%;
      height: 104px;
      font-weight: 700;
      font-size: 20px;
      line-height: 32px;
      display: flex;
      padding: 0 20px;
      align-items: center;
      justify-content: start;
      background-image: url('/src/assets/images/login_h5.jpg');
      background-size: 100% 100%;
      box-sizing: border-box;

      img {
        width: 34px;
        height: 34px;
        margin-right: 8px;
      }
    }

    &-box {
      width: 100%;
      display: flex;
      z-index: 999;
    }
  }

  .login-right {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 30px 30px 0;
    box-sizing: border-box;

    &__title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 20px;
      line-height: 32px;
      margin-bottom: 20px;
    }

    &__form {
      :deep(.arco-tabs-nav-tab) {
        display: flex;
        justify-content: start;
        align-items: center;
      }

      :deep(.arco-tabs-tab) {
        color: var(--color-text-2);
        margin: 0 20px 0 0;
      }

      :deep(.arco-tabs-tab-title) {
        font-size: 16px;
        font-weight: 500;
        line-height: 22px;
      }

      :deep(.arco-tabs-content) {
        margin-top: 10px;
      }

      :deep(.arco-tabs-tab-active),
      :deep(.arco-tabs-tab-title:hover) {
        color: rgb(var(--arcoblue-6));
      }

      :deep(.arco-tabs-nav::before) {
        display: none;
      }

      :deep(.arco-tabs-tab-title:before) {
        display: none;
      }
    }

    &__oauth {
      width: 100%;
      position: fixed;
      bottom: 0;
      left: 0;
      padding-bottom: 20px;

      // margin-top: auto;
      // margin-bottom: 20px;
      :deep(.arco-divider-text) {
        color: var(--color-text-4);
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
      }

      .list {
        align-items: center;
        display: flex;
        justify-content: center;
        width: 100%;

        .item {
          margin-right: 15px;
        }

        .mode {
          color: var(--color-text-2);
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          padding: 6px 10px;
          align-items: center;
          border: 1px solid var(--color-border-3);
          border-radius: 32px;
          box-sizing: border-box;
          display: flex;
          height: 32px;
          justify-content: center;
          cursor: pointer;

          .icon {
            width: 21px;
            height: 20px;
          }
        }

        .mode svg {
          font-size: 16px;
          margin-right: 10px;
        }

        .mode:hover,
        .mode svg:hover {
          background: rgba(var(--primary-6), 0.05);
          border: 1px solid rgb(var(--primary-3));
          color: rgb(var(--arcoblue-6));
        }
      }
    }
  }

  .theme-btn {
    position: fixed;
    top: 20px;
    right: 30px;
    z-index: 9999;
  }

  .footer {
    align-items: center;
    box-sizing: border-box;
    position: absolute;
    bottom: 10px;
    z-index: 999;

    .beian {
      .text {
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.2px;
        line-height: 20px;
        text-align: center;
      }

      .below {
        align-items: center;
        display: flex;
      }
    }
  }
}

@media screen and (min-width: 571px) {
  .h5 {
    display: none !important;
  }

  .login {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--color-bg-5);

    &-logo {
      position: fixed;
      top: 20px;
      left: 30px;
      z-index: 9999;
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 20px;
      line-height: 32px;
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 34px;
        height: 34px;
        margin-right: 8px;
      }
    }

    &-box {
      width: 86%;
      max-width: 850px;
      height: 490px;
      display: flex;
      z-index: 999;
      box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.08);
    }
  }

  .login-left {
    height: 100%;
    background: linear-gradient(180deg, #f0f5ff 0%, #e6f0ff 100%);
    padding: 40px 30px;
    color: #333;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border-radius: 8px 0 0 8px;
    /* 与右侧卡片呼应圆角 */
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 15px rgba(22, 119, 255, 0.05);
    /* 内阴影增强层次 */
  }

  /* 装饰光点，提升氛围感 */
  .login-left::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }

  .login-left h4 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1677ff;
    /* 主色突出标题 */
    position: relative;
    z-index: 1;
  }

  .login-left p {
    margin-bottom: 24px;
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }

  .login-left ul {
    list-style: none;
    padding: 0;
    flex: 1;
    /* 占满剩余高度 */
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    /* 均匀分布，比space-between更自然 */
    position: relative;
    z-index: 1;
  }

  .login-left li {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    line-height: 1.8;
    padding: 8px 0;
    transition: transform 0.2s ease;
    position: relative;
  }

  /* 美化勾选图标 */
  .login-left li::before {
    content: "✓";
    display: inline-block;
    width: 20px;
    height: 20px;
    background: #1677ff;
    color: #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
    box-shadow: 0 2px 6px rgba(22, 119, 255, 0.2);
  }

  /* hover交互效果 */
  .login-left li:hover {
    transform: translateX(5px);
    color: #1677ff;
  }

  /* 列表项分隔线，增强规整度 */
  .login-left li:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 32px;
    /* 避开图标 */
    width: calc(100% - 32px);
    height: 1px;
    background: linear-gradient(90deg, rgba(22, 119, 255, 0.1) 0%, transparent 100%);
  }


  .login-right {
    width: 100%;
    height: 100%;
    background: var(--color-bg-1);
    display: flex;
    flex-direction: column;
    padding: 30px 30px 0;
    box-sizing: border-box;

    &__title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 20px;
      line-height: 32px;
      margin-bottom: 20px;
    }

    &__form {
      :deep(.arco-tabs-nav-tab) {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      :deep(.arco-tabs-tab) {
        color: var(--color-text-2);
      }

      :deep(.arco-tabs-tab-title) {
        font-size: 16px;
        font-weight: 500;
        line-height: 22px;
      }

      :deep(.arco-tabs-content) {
        margin-top: 10px;
      }

      :deep(.arco-tabs-tab-active),
      :deep(.arco-tabs-tab-title:hover) {
        color: rgb(var(--arcoblue-6));
      }

      :deep(.arco-tabs-nav::before) {
        display: none;
      }

      :deep(.arco-tabs-tab-title:before) {
        display: none;
      }
    }

    &__oauth {
      margin-top: auto;
      margin-bottom: 20px;

      :deep(.arco-divider-text) {
        color: var(--color-text-4);
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
      }

      .list {
        align-items: center;
        display: flex;
        justify-content: center;
        width: 100%;

        .item {
          margin-right: 15px;
        }

        .mode {
          color: var(--color-text-2);
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          padding: 6px 10px;
          align-items: center;
          border: 1px solid var(--color-border-3);
          border-radius: 32px;
          box-sizing: border-box;
          display: flex;
          height: 32px;
          justify-content: center;
          cursor: pointer;

          .icon {
            width: 21px;
            height: 20px;
          }
        }

        .mode svg {
          font-size: 16px;
          margin-right: 10px;
        }

        .mode:hover {
          background: rgba(var(--primary-6), 0.05);
          border: 1px solid rgb(var(--primary-3));
          color: rgb(var(--arcoblue-6));
        }
      }
    }
  }

  .theme-btn {
    position: fixed;
    top: 20px;
    right: 30px;
    z-index: 9999;
  }

  .footer {
    align-items: center;
    box-sizing: border-box;
    position: absolute;
    bottom: 10px;
    z-index: 999;

    .beian {
      .text {
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.2px;
        line-height: 20px;
        text-align: center;
      }

      .below {
        align-items: center;
        display: flex;
      }
    }
  }
}
</style>
