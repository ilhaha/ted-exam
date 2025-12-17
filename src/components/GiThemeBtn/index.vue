<template>
<div>
  <!-- <a-button size="mini" class="gi_hover_btn" @click="toggle" v-if="!isFullscreen">
    <template #icon>
      <icon-fullscreen v-if="!isFullscreen" :size="18" />
      <icon-fullscreen-exit v-else :size="18" />
    </template>
  </a-button> -->
  <a-button size="mini" class="gi_hover_btn" @click="handleToggleTheme">
    <template #icon>
      <icon-moon-fill v-if="appStore.theme === 'light'" :size="18" />
      <icon-sun-fill v-else :size="18" />
    </template>
  </a-button>
</div>

</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useAppStore } from '@/stores'

import { useFullscreen } from '@vueuse/core'

const { isFullscreen, toggle } = useFullscreen()

defineOptions({ name: 'GiThemeBtn' })
const appStore = useAppStore()

const isDark = useDark({
  selector: 'body',
  attribute: 'arco-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'arco-theme',
  onChanged(dark: boolean) {
    appStore.toggleTheme(dark)
  },
})

const toggleTheme = useToggle(isDark)

const handleToggleTheme = () => {
  toggleTheme()
}
</script>
