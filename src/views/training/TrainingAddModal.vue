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
import { getTraining, addTraining, updateTraining } from '@/apis/training/training'
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
const title = computed(() => (isUpdate.value ? '修改培训主表' : '新增培训主表'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '培训名称',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入培训名称' }]
  },
  {
    label: '视频总时长（秒）',
    field: 'totalDuration',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入视频总时长（秒）' }]
  },
  {
    label: '专家ID',
    field: 'expertId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入专家ID' }]
  },
  {
    label: '费用',
    field: 'fee',
    type: 'textarea',
    props: {
      autoSize: true
    },
    span: 24,
  },
  {
    label: '培训描述',
    field: 'description',
    type: 'input',
    span: 24,
  },
  {
    label: '0-上架 1-下架',
    field: 'status',
    type: 'switch',
    span: 24,
  },
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
      await updateTraining(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addTraining(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getTraining(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
