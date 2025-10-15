<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getChapter, addChapter, updateChapter,customizeAddChapter,customizeUpdateChapter } from '@/apis/training/chapter'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改章节' : '新增章节'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '章节标题',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入章节标题' }]
  },
  {
  label: '排序序号',
  field: 'sort',
  type: 'input-number',
  span: 24,
  rules: [{ required: true, message: '请输入排序序号' }]
}
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await customizeUpdateChapter(form, dataId.value)
      Message.success('修改成功')
    } else {
      await customizeAddChapter(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}




// 新增
const onAdd = async (trainingId?: string,parentId?: string) => {
  reset()
  dataId.value = ''
  visible.value = true
  Object.assign(form, { trainingId ,parentId})
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getChapter(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
