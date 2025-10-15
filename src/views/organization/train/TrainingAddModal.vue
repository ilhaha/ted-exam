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
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <!-- 新增封面图上传插槽 -->
      <template #coverPath>
        <div class="upload-wrapper">
          <a-upload
            v-model:file-list="coverFiles"
            action="/api/upload/file"
            :headers="{ Authorization: `Bearer ${getToken()}` }"
            :data="{ type: 'pic' }"
            :limit="1"
            accept="image/png,image/jpeg"
            list-type="picture-card"
            @success="handleCoverSuccess"
            @remove="handleCoverRemove"
          >
            <template #upload-button>
              <div class="upload-trigger">
                <IconPlus />
                <div class="upload-text">上传封面</div>
              </div>
            </template>
          </a-upload>
        </div>
      </template>

    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addTraining, getTraining, updateTraining, listExperts } from '@/apis/training/training'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import {getToken} from "@/utils/auth";
import { ref, watch } from 'vue'
import {getProjectList} from "@/apis/project/project";
const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改培训主表' : '新增培训主表'))
const formRef = ref<InstanceType<typeof GiForm>>()

// 在表单定义中添加 coverPath 字段
const [form, resetForm] = useResetReactive({
  title: '',
  expertId: '',
  projectId: '',
  fee: '',
  description: '',
  status: 0,
  coverPath: '', // 新增封面图字段
  expertFee: '',
})

// 新增封面图相关状态
const coverFiles = ref([])

// 新增专家列表数据
const expertOptions = ref<{ label: string; value: string }[]>([])
const projectOptions = ref<{ label: string; value: string }[]>([])

// 获取专家列表
const getExpertList = async () => {
  try {
    const { data } = await listExperts()
    expertOptions.value = data.map((item) => ({
      label: item.name,
      value: Number(item.id),
    }))
  } catch {
    Message.error('请先添加专家')
  }
  
}

// 获取项目列表
const handleGetProjectList = async () => {
  const params = `page=${1}&size=${99}`
  const res = await getProjectList(params)
  projectOptions.value = res.data.list.map((item) => ({
    label: item.projectName,
    value: item.id,
  }))
}


// 监听visible变化，当打开模态框时获取专家列表
watch(visible, async (val) => {
  if (val) {
    await getExpertList()
    await handleGetProjectList()
  }
})

const columns = reactive<ColumnItem[]>([
  {
    label: '培训名称',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入培训名称' }],
  },
  {
    label: '封面图',
    field: 'coverPath',
    type: 'slot',
    slotName: 'coverPath',
    span: 24,
  },
  {
    label: '专家',
    field: 'expertId',
    type: 'select',
    span: 24,
    props: {
      options: expertOptions,
      placeholder: '请选择专家',
    },
    rules: [{ required: true, message: '请选择专家' }],
  },
  {
    label: '项目',
    field: 'projectId',
    type: 'select',
    span: 24,
    props: {
      options: projectOptions,
      placeholder: '请选择项目',
    },
    rules: [{ required: true, message: '请选择项目' }],
  },
  {
    label: '培训课程收费',
    field: 'fee',
    type: 'input-number',
    props: {
      autoSize: true,
    },
    span: 24,
    rules: [
      {
        required: true,
        message: '请输入培训课程费用',
      },
      {
        validator: (value, cb) => {
          if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            cb('小数点长度不可超过两位')
            return
          }
          cb()
        },
      }],
  },
  // {
  //   label: '专家收费',
  //   field: 'expertFee',
  //   type: 'textarea',
  //   props: {
  //     autoSize: true,
  //   },
  //   span: 24,
  //   rules: [{ required: true, message: '请输入专家收费费用' }],
  // },
  {
    label: '培训描述',
    field: 'description',
    type: 'input',
    span: 24,
  },
])

// 新增上传处理逻辑
const handleCoverSuccess = (fileRes: any) => {
  if (fileRes.response && fileRes.response.code === "0") {
    console.log(fileRes.response.data.url)
    form.coverPath = fileRes.response.data.url // 根据实际接口调整路径
  }
}

const handleCoverRemove = () => {
  form.coverPath = ''
  coverFiles.value = []
}

// 初始化时加载已有封面图
watch(visible, async (val) => {
  if (val && isUpdate.value && form.coverPath) {
    coverFiles.value = [{
      uid: Date.now(),
      name: '封面图',
      status: 'done',
      url: form.coverPath,
    }]
  } else {
    coverFiles.value = []
  }
})

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    console.log(form)
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

<style scoped lang="scss">
.upload-wrapper {
  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-3);
    
    .upload-text {
      margin-top: 8px;
      font-size: 14px;
    }
  }
}
</style>
