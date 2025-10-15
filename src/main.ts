import { createApp } from 'vue'
import ArcoVue, { Card, Drawer, Modal } from '@arco-design/web-vue'
import '@/styles/arco-ui/index.less'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import '@arco-themes/vue-gi-demo/index.less'
// import '@arco-design/web-vue/dist/arco.css'

// 额外引入 Arco Design Icon图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import VueVideoPlayer from '@videojs-player/vue'
import App from './App.vue'
import router from './router'

// 使用动画库
import 'animate.css/animate.min.css'

// 自定义过渡动画
import '@/styles/css/transition.css'

// 导入全局scss主文件
import '@/styles/index.scss'

// 支持SVG
import 'virtual:svg-icons-register'

// 自定义指令
import directives from './directives'

// 状态管理
import pinia from '@/stores'
// 导入视频播放组件
import 'video.js/dist/video-js.css'

const app = createApp(App)
// 视频播放组件
app.use(VueVideoPlayer)

// 对特定组件进行默认配置
Card.props.bordered = false

Modal._context = app._context
Drawer._context = app._context

app.use(router)
app.use(pinia)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(directives)
app.use(ElementPlus)

app.mount('#app')
