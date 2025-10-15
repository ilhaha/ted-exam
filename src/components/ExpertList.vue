<template>
  <div class="expert-container">
    <div class="toolbar">
      <div class="left">
        <a-button type="primary" @click="addExpertVisible = true">
          <template #icon>
            <icon-plus />
          </template>
          新增专家
        </a-button>
        <span v-if="selectedKeys.length" class="selected-text">
          已选择 {{ selectedKeys.length }} 项
        </span>
      </div>
      <div class="right">
        <!-- 新增时间选择 -->
        <a-range-picker
          v-model:model-value="rangeValue"
          show-time
          model-value-format="timestamp"
          style="margin-right: 12px; width: 320px"
          @change="handleRangeChange"
        />
        <a-button
          type="outline"
          style="margin-right: 12px"
          @click="handleQueryShouldPay"
        >
          <template #icon>
            <icon-search />
          </template>
          查询应支付
        </a-button>

        <a-select
          v-model="exportStatus"
          placeholder="选择费用状态"
          style="width: 120px; margin-right: 12px"
          allow-clear
        >
          <a-option :value="3">全部</a-option>
          <a-option :value="0">未设置费用</a-option>
          <a-option :value="1">未结清</a-option>
          <a-option :value="2">已结清</a-option>
        </a-select>

        <a-button
          type="outline"
          style="margin-right: 12px"
          :disabled="shouldPayList.length === 0 && selectedKeys.length === 0"
          @click="handleExport"
        >
          <template #icon>
            <icon-download />
          </template>
          导出Excel
        </a-button>
      </div>
    </div>

    <!-- 新增应支付结果展示 -->
    <a-collapse
      v-if="shouldPayList.length > 0"
      :default-active-key="['1']"
      style="margin: 20px 0"
    >
      <a-collapse-item key="1" header="查询结果">
        <a-table
          :data="shouldPayList"
          :columns="[
            { title: '专家姓名', dataIndex: 'expertName' },
            { title: '培训项目', dataIndex: 'projectName' },
            { title: '劳务费用(元)', dataIndex: 'free' },
            { title: '截至时间', dataIndex: 'payDeadlineTime' },
            { title: '结清时间', dataIndex: 'payCompletionTime', slotName: 'payCompletionTime' },
            { title: '状态', dataIndex: 'status', slotName: 'status' }
          ]"
          :pagination="{
            current: shouldPayPagination.current,
            pageSize: shouldPayPagination.pageSize,
            total: shouldPayPagination.total,
            showTotal: true,
            showJumper: true,
            showPageSize: true,
          }"
          :bordered="false"
          @page-change="handleShouldPayPageChange"
          @page-size-change="handleShouldPayPageSizeChange"
        >
          <template #empty>
            <div class="empty-table">
              <icon-exclamation-circle />
              未查询到应支付记录
            </div>
          </template>
          <template #payCompletionTime="{ record }">
            <span>{{ record.payCompletionTime || '-' }}</span>
          </template>
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table>
      </a-collapse-item>
    </a-collapse>

    <a-table
      v-model:selected-keys="selectedKeys"
      :data="expertList"
      :columns="columns"
      :loading="loading"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showTotal: true,
        showJumper: true,
        showPageSize: true, // 显示分页大小切换
      }"
      :bordered="false"
      :row-selection="{
        type: 'checkbox',
        showCheckedAll: true,
      }"
      row-key="expertId"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #empty>
        <div class="empty-table">
          <icon-exclamation-circle />
          暂无专家费用数据
        </div>
      </template>
      <!-- 状态列自定义渲染 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 图片列自定义渲染 -->
      <template #image="{ record }">
        <div class="expert-image">
          <img 
            v-if="record.imageUrl" 
            :src="record.imageUrl" 
            :alt="record.name"
            class="expert-avatar"
            @click="handleImageClick(record.imageUrl, record.name)"
          />
          <div v-else class="expert-avatar-placeholder">
            {{ record.name.charAt(0) }}
          </div>
        </div>
      </template>

      <!-- 操作列自定义渲染 -->
      <template #operation="{ record }">
        <div class="operation-buttons" style="text-align: center">
          <a-button type="text" @click="handleViewDetail(record)">
            <template #icon>
              <icon-eye />
            </template>
            查看项目
          </a-button>
          <a-button type="text" @click="handleEditExpert(record)">
            <template #icon>
              <icon-edit />
            </template>
            修改专家
          </a-button>
          <a-button
            v-if="record.status === 0"
            type="primary"
            size="small"
            @click="handleSetFee(record)"
          >
            设置费用
          </a-button>
          <a-button
            v-if="record.status === 1"
            type="primary"
            size="small"
            @click="handleSetSettled(record)"
          >
            设置已结清
          </a-button>
        </div>
      </template>
    </a-table>

    <!-- 图片预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      :footer="false"
      :title="previewTitle"
      width="600px"
      @cancel="previewVisible = false"
    >
      <div class="preview-container">
        <img 
          :src="previewImage" 
          class="preview-image" 
          :style="{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain'
          }"
        />
      </div>
    </a-modal>

    <!-- 详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="培训项目详情"
      :footer="false"
      width="800px"
      @cancel="detailVisible = false"
    >
      <div class="detail-container" style="text-align: center">
        <a-spin :loading="detailLoading">
          <a-table
            :data="currentExpert?.projects"
            :columns="detailColumns"
            :pagination="false"
            :bordered="false"
            class="detail-table"
          >
            <template #empty>
              <div class="empty-table" style="text-align: center">
                <icon-exclamation-circle />
                暂无培训项目数据
              </div>
            </template>
            
            <template #status="{ record }">
              <a-tag :color="getStatusColor(record.status)" class="status-tag">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <template #payCompletionTime="{ record }">
              <span v-if="record.status === 2">{{ record.payCompletionTime }}</span>
              <span v-else>-</span>
            </template>

            <template #operation="{ record }">
              <a-button
                v-if="record.status === 0"
                type="primary"
                size="small"
                @click="handleSetFee(record)"
              >
                设置费用
              </a-button>
              <a-button
                v-if="record.status === 1"
                type="primary"
                size="small"
                @click="handleSetSettled(record)"
              >
                设置已结清
              </a-button>
            </template>
          </a-table>
        </a-spin>
      </div>
    </a-modal>

    <!-- 新增/修改专家模态框 -->
    <a-modal
      v-model:visible="addExpertVisible"
      :title="isEditMode ? '修改专家' : '新增专家'"
      :footer="false"
      width="600px"
      @cancel="handleCancel"
    >
      <a-form
        :model="addExpertForm"
        @submit="handleAddExpert"
      >
        <a-form-item field="name" label="专家姓名">
          <a-input
            v-model="addExpertForm.name"
            placeholder="请输入专家姓名"
            allow-clear
          />
        </a-form-item>

        <a-form-item v-show="!isEditMode" field="idCard" label="身份证号">
          <a-input
            v-model="addExpertForm.idCard"
            placeholder="请输入身份证号"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="education" label="学历">
          <a-select
            v-model="addExpertForm.education"
            placeholder="请选择学历"
            allow-clear
          >
            <a-option value="本科">本科</a-option>
            <a-option value="硕士">硕士</a-option>
            <a-option value="博士">博士</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="title" label="专家称号">
          <a-input
            v-model="addExpertForm.title"
            placeholder="请输入专家称号"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="avatar" label="专家头像">
          <div class="upload-wrapper">
            <a-upload
              v-model:file-list="avatarFiles"
              action="/api/upload/file"
              :headers="{ Authorization: `Bearer ${getToken()}` }"
              :data="{ type: 'pic' }"
              :limit="1"
              accept="image/png,image/jpeg"
              list-type="picture-card"
              @success="handleAvatarSuccess"
              @remove="handleAvatarRemove"
              @preview="handlePreview"
            >
              <template #upload-button>
                <div class="upload-trigger">
                  <icon-plus />
                  <div class="upload-text">点击上传头像</div>
                </div>
              </template>
            </a-upload>
          </div>
        </a-form-item>

        <div class="form-actions" style="display: flex; flex-direction: row-reverse;">
          <a-button type="primary" html-type="submit" :loading="formLoading">
            {{ isEditMode ? '保存修改' : '确定' }}
          </a-button>
          <a-button @click="handleCancel">取消</a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- 设置费用模态框 -->
    <a-modal
      v-model:visible="setFeeVisible"
      title="设置费用"
      :footer="false"
      width="400px"
      @cancel="handleCancelSetFee"
    >
      <div class="set-fee-container">
        <div class="project-info">
          <span class="label">培训项目：</span>
          <span class="value">{{ currentProject?.examName }}</span>
        </div>
        
        <a-form
          :model="feeForm"
          layout="vertical"
          @submit="handleConfirmSetFee"
        >
          <a-form-item
            field="fee"
            label="劳务费用"
            :rules="[
              { required: true, message: '请输入劳务费用' },
              { type: 'number', min: 0, message: '费用不能小于0' }
            ]"
          >
            <a-input-number
              v-model="feeForm.fee"
              placeholder="请输入劳务费用"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 100%"
            >
              <template #append>元</template>
            </a-input-number>
          </a-form-item>

          <div class="form-actions">
            <a-button @click="handleCancelSetFee">取消</a-button>
            <a-button type="primary" html-type="submit" :loading="feeFormLoading">
              确定
            </a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import { getToken } from '@/utils/auth'
import * as XLSX from 'xlsx'  // 添加 xlsx 导入
import {
  type ExpertFreeShouldResp,
  queryExpertFree,
  queryExpertShouldPay,
  queryExpertDetail,
  addExpert,  // 添加 addExpert API 导入
  updateExpert,
  queryExpertDetailLISt,
  updateExpertFree,  // 添加 updateExpertFree 导入
  exportSelectedExperts,  // 添加新的API导入
  type ExportSelectedExpertsResp,  // 添加新的类型导入
  type ExportSelectedExpertsReq  // 添加新的请求类型导入
} from '@/apis/organization/organization'

// 专家数据
const expertList = ref<Array<{
  expertId: string
  name: string
  title: string
  imageUrl: string
}>>([])

// 表格列定义
const columns = [
  {
    title: '专家照片',
    dataIndex: 'imageUrl',
    slotName: 'image',
    align: 'center',
  },
  {
    title: '专家姓名',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: '专家称号',
    dataIndex: 'title',
    align: 'center',
  },
  {
    title: '操作',
    slotName: 'operation',
    align: 'center',
  },
]

const rangeValue = ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs()])
const shouldPayList = ref<ExpertFreeShouldResp[]>([])
const shouldPayPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const handleQueryShouldPay = async () => {
  try {
    const start = dayjs(rangeValue.value[0])
    const end = dayjs(rangeValue.value[1])

    const params = {
      begin: start.format('YYYY-MM-DDTHH:mm:ss'),
      end: end.format('YYYY-MM-DDTHH:mm:ss'),
    }

    const { data } = await queryExpertShouldPay(params.begin, params.end)
    shouldPayList.value = data
    shouldPayPagination.value.total = data.length // 更新总数
  } catch (error) {
    console.error('完整错误信息:', error)
  }
}

// 选中的行
const selectedKeys = ref<string[]>([])

// 加载状态
const loading = ref(false)

// 分页参数
const pagination = ref({
  current: 1, // 当前页码
  pageSize: 10, // 每页条数
  total: 0, // 总数据量（由后端返回）
})

// 添加预览图片相关的状态
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

// 处理图片点击
const handleImageClick = (imageUrl: string, name: string) => {
  if (!imageUrl) return
  previewImage.value = imageUrl
  previewTitle.value = name
  previewVisible.value = true
}

// 详情模态框相关状态
const detailVisible = ref(false)
const currentExpert = ref<{
  expertId: string
  name: string
  title: string
  imageUrl: string
  idCard: string
  education: string
  projects: Array<{
    examName: string
    fee: number
    status: number
    projectId: string
    payDeadlineTime: string
    payCompletionTime: string
  }>
} | null>(null)
const detailLoading = ref(false)

// 处理查看详情
const handleViewDetail = async (record: typeof expertList.value[0]) => {
  try {
    if (!record.expertId) {
      Message.error('专家ID不存在')
      return
    }

    detailLoading.value = true
    detailVisible.value = true
    const { data } = await queryExpertDetail(record.expertId)
    currentExpert.value = {
      ...record,
      idCard: data?.idCard || '',
      education: data?.education || '',
      projects: Array.isArray(data) ? data.map(item => ({
        examName: item.projectName,
        fee: item.free,
        status: item.status || 0,
        projectId: item.projectId || '',
        payDeadlineTime: item.payDeadlineTime || '',
        payCompletionTime: item.payCompletionTime || ''  // 添加结清时间字段
      })) : []
    }
  } catch (error) {
    Message.error('获取专家详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 详情表格列定义
const detailColumns = [
  {
    title: '培训项目',
    dataIndex: 'examName',
    align: 'center',
  },
  {
    title: '劳务费用(元)',
    dataIndex: 'fee',
    align: 'center',
  },
  {
    title: '截至时间',
    dataIndex: 'payDeadlineTime',
    align: 'center',
  },
  {
    title: '结清时间',
    dataIndex: 'payCompletionTime',
    slotName: 'payCompletionTime',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    align: 'center',
  },
  {
    title: '操作',
    slotName: 'operation',
    align: 'center',
  }
]

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未设置费用'
    case 1:
      return '未结清'
    case 2:
      return '已结清'
    default:
      return '未知状态'
  }
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'orange'
    case 1:
      return 'red'
    case 2:
      return 'green'
    default:
      return 'gray'
  }
}

// 设置费用相关状态
const setFeeVisible = ref(false)
const currentProject = ref<{
  examName: string
  fee: number
  status: number
  projectId: string
  payDeadlineTime?: string
} | null>(null)
const feeForm = ref({
  fee: 0
})
const feeFormLoading = ref(false)

// 处理设置费用
const handleSetFee = (record: any) => {
  currentProject.value = record
  feeForm.value.fee = record.fee || 0
  setFeeVisible.value = true
}

// 处理取消设置费用
const handleCancelSetFee = () => {
  setFeeVisible.value = false
  currentProject.value = null
  feeForm.value.fee = 0
}

// 处理确认设置费用
const handleConfirmSetFee = async () => {
  if (!currentProject.value) return

  try {
    feeFormLoading.value = true
    const data = {
      idCard: currentExpert.value?.idCard || '',
      education: currentExpert.value?.education || '',
      projectName: currentProject.value.examName,
      projectId: currentProject.value.projectId,
      payDeadlineTime: currentProject.value.payDeadlineTime || '',  // 使用 payDeadlineTime 字段
      free: feeForm.value.fee,
      status: '1'  // 设置为未结清状态，注意这里是字符串类型
    }
    const response = await updateExpertFree(currentProject.value.projectId, data)

    if (response.data?.code === 500) {
      Message.error(response.data.msg || '设置费用失败')
      return
    }

    Message.success('设置费用成功')
    setFeeVisible.value = false
    // 刷新详情数据
    if (currentExpert.value?.expertId) {
      handleViewDetail(currentExpert.value)
    }
  } catch (error: any) {
    Message.error(error?.response?.data?.msg || '设置费用失败')
  } finally {
    feeFormLoading.value = false
  }
}

// 修改后的 fetchExpertData 函数
const fetchExpertData = async () => {
  try {
    loading.value = true
    // 调用接口时传递正确的分页参数
    const { data } = await queryExpertFree(
        pagination.value.current,
        pagination.value.pageSize,
    )

    // 映射数据时使用后端返回的正确字段
    expertList.value = Array.isArray(data.res) ? data.res.map(item => ({
      expertId: item.expertId ? String(item.expertId) : '', // 确保expertId存在且为string类型
      name: item.expertName || '',
      title: item.expertTitle || '',
      imageUrl: item.imageUrl || ''
    })) : []

    // 更新总条数
    pagination.value.total = data.total
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchExpertData()
})

// 添加导出状态选择
const exportStatus = ref<number | undefined>(undefined)

// 处理导出
const handleExport = async () => {
  // 如果有查询结果，优先导出查询结果
  if (shouldPayList.value.length > 0) {
    exportToExcel()
    return
  }

  // 否则导出选中的专家
  if (selectedKeys.value.length === 0) {
    Message.warning('请选择需要导出的专家')
    return
  }

  // 添加状态验证
  if (exportStatus.value === undefined) {
    Message.warning('请选择费用状态')
    return
  }

  try {
    // 1. 准备请求参数
    const params: ExportSelectedExpertsReq = {
      expertIds: selectedKeys.value,
      status: exportStatus.value
    }

    console.log('Export params:', params)

    // 2. 调用后端接口获取数据
    const { data } = await exportSelectedExperts(params)

    // 3. 准备导出数据
    const excelData = data.map((item) => ({
      '专家姓名': item.expertName,
      '培训项目': item.projectName,
      '劳务费用(元)': item.free,
      '截至时间': item.payDeadlineTime,
      '结清时间': item.payCompletionTime || '-',
      '状态': item.status === 0 ? '未设置费用' :
          item.status === 1 ? '未结清' :
              item.status === 2 ? '已结清' : '未知状态'
    }))

    // 4. 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: ['专家姓名', '培训项目', '劳务费用(元)', '截至时间', '结清时间', '状态'],
      skipHeader: false,
    })

    // 5. 设置列宽
    worksheet['!cols'] = [
      { wch: 15 }, // 专家姓名列宽
      { wch: 20 }, // 培训项目列宽
      { wch: 15 }, // 劳务费用列宽
      { wch: 20 }, // 截至时间列宽
      { wch: 20 }, // 结清时间列宽
      { wch: 12 }, // 状态列宽
    ]

    // 6. 创建并写入工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '专家费用报表')

    // 7. 导出文件
    const statusText = exportStatus.value === 3 ? '全部' :
        exportStatus.value === 0 ? '未设置费用' :
            exportStatus.value === 1 ? '未结清' :
                exportStatus.value === 2 ? '已结清' : '未知状态'
    XLSX.writeFile(workbook, `专家费用_${statusText}_${dayjs().format('YYYY-MM-DD')}.xlsx`)

    Message.success('导出成功')
    // 导出成功后清空状态选择
    exportStatus.value = undefined
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败，请重试')
  }
}

// 新增专家相关状态
const addExpertVisible = ref(false)
const addExpertForm = ref({
  name: '',
  idCard: '',
  education: '',
  title: '',
  avatar: '',
})
const avatarFiles = ref([])
const formLoading = ref(false)
const isEditMode = ref(false) // 添加编辑模式标志
const currentEditId = ref('') // 添加当前编辑的专家ID

// 处理头像上传成功
const handleAvatarSuccess = (fileRes: any) => {
  if (fileRes.response && fileRes.response.code === "0") {
    addExpertForm.value.avatar = fileRes.response.data.url
  }
}

// 处理头像移除
const handleAvatarRemove = () => {
  addExpertForm.value.avatar = ''
  avatarFiles.value = []
}

// 监听模态框显示状态，处理头像预览
watch(addExpertVisible, (val) => {
  if (val && addExpertForm.value.avatar) {
    avatarFiles.value = [{
      uid: Date.now(),
      name: '专家头像',
      status: 'done',
      url: addExpertForm.value.avatar
    }]
  } else {
    avatarFiles.value = []
  }
})

// 验证身份证号码
const validateIdCard = (idCard: string): boolean => {
  // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

// 验证表单所有字段
const validateForm = (): boolean => {
  const { name, idCard, education, title } = addExpertForm.value

  if (!name?.trim()) {
    Message.error('请输入专家姓名')
    return false
  }

  if (!idCard?.trim()) {
    Message.error('请输入身份证号')
    return false
  }

  if (!validateIdCard(idCard) && !isEditMode.value) {
    Message.error('请输入正确的身份证号码格式')
    return false
  }

  if (!education?.trim()) {
    Message.error('请选择学历')
    return false
  }

  if (!title?.trim()) {
    Message.error('请输入专家称号')
    return false
  }

  return true
}

// 处理编辑专家
const handleEditExpert = async (record: typeof expertList.value[0]) => {
  try {
    isEditMode.value = true
    currentEditId.value = record.expertId
    // 获取专家详细信息
    const { data } = await queryExpertDetailLISt(record.expertId)
    addExpertForm.value = {
      name: record.name,
      idCard: data?.idCard || '', // 从详情中获取身份证号
      education: data?.education || '', // 从详情中获取学历
      title: record.title,
      avatar: record.imageUrl
    }
    addExpertVisible.value = true
  } catch (error) {
    Message.error('获取专家信息失败')
  }
}

// 处理取消按钮点击
const handleCancel = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  addExpertForm.value = {
    name: '',
    idCard: '',
    education: '',
    title: '',
    avatar: ''
  }
  avatarFiles.value = []
  addExpertVisible.value = false
  isEditMode.value = false
  currentEditId.value = ''
}

// 处理新增/修改专家
const handleAddExpert = async () => {
  try {
    // 验证所有必填字段
    if (!validateForm()) {
      return
    }

    formLoading.value = true
    // 创建 JSON 数据对象
    const expertData = {
      name: addExpertForm.value.name.trim(),
      idCard: addExpertForm.value.idCard.trim(),
      education: addExpertForm.value.education.trim(),
      title: addExpertForm.value.title.trim(),
      avatar: addExpertForm.value.avatar
    }

    if (isEditMode.value) {
      // 调用修改专家API
      const response = await updateExpert(currentEditId.value, expertData)
      if (response.data?.code === 500) {
        Message.error(response.data.msg || '修改专家失败')
        return
      }
      Message.success('修改专家成功')
    } else {
      // 调用新增专家API
      const response = await addExpert(expertData)
      if (response.data?.code === 500) {
        Message.error(response.data.msg || '新增专家失败')
        return
      }
      Message.success('新增专家成功')
    }

    addExpertVisible.value = false
    resetForm()
    // 刷新列表
    fetchExpertData()
  } catch (error: any) {
    // 处理其他错误
    Message.error(error?.response?.data?.msg || (isEditMode.value ? '修改专家失败' : '新增专家失败'))
  } finally {
    formLoading.value = false
  }
}

// 处理图片预览
const handlePreview = (file: any) => {
  previewImage.value = file.url
  previewVisible.value = true
}

// 处理时间范围变化
const handleRangeChange = () => {
  if (!rangeValue.value || rangeValue.value.length !== 2) {
    // 当时间范围被清空时，清空查询结果
    shouldPayList.value = []
    shouldPayPagination.value.total = 0
    return
  }
  handleQueryShouldPay()
}

// 监听时间范围选择器
watch(rangeValue, (newVal) => {
  if (!newVal || newVal.length !== 2) {
    // 当时间范围被清空时，清空查询结果
    shouldPayList.value = []
    shouldPayPagination.value.total = 0
  }
})

// 处理设置已结清
const handleSetSettled = async (record: any) => {
  try {
    const data = {
      idCard: currentExpert.value?.idCard || '',
      education: currentExpert.value?.education || '',
      projectName: record.examName,
      projectId: record.projectId,
      examStopDate: record.examStopDate || '',  // 添加必需的 examStopDate 字段
      payDeadlineTime: record.payDeadlineTime || '',
      free: record.fee,
      status: '2',  // 设置为已结清状态
      payCompletionTime: ''  // 由后端设置结清时间
    }
    const response = await updateExpertFree(record.projectId, data)

    if (response.data?.code === 500) {
      Message.error(response.data.msg || '设置已结清失败')
      return
    }

    Message.success('设置已结清成功')
    // 刷新详情数据
    if (currentExpert.value?.expertId) {
      handleViewDetail(currentExpert.value)
    }
  } catch (error: any) {
    Message.error(error?.response?.data?.msg || '设置已结清失败')
  }
}

// 处理查询结果分页变化
const handleShouldPayPageChange = (current: number) => {
  shouldPayPagination.value.current = current
}

const handleShouldPayPageSizeChange = (pageSize: number) => {
  shouldPayPagination.value.pageSize = pageSize
  shouldPayPagination.value.current = 1
}

// 分页事件处理函数
const handlePageChange = (current: number) => {
  pagination.value.current = current
  fetchExpertData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1 // 切换页容量时回到第一页
  fetchExpertData()
}

// 修复后的 getTimeRange 函数
const getTimeRange = () => {
  if (!rangeValue.value || rangeValue.value.length !== 2) {
    return '未选择时间范围'
  }

  // 显式转换为 dayjs 对象
  const start = dayjs(rangeValue.value[0])
  const end = dayjs(rangeValue.value[1])

  // 添加有效性校验
  if (!start.isValid() || !end.isValid()) {
    return '无效时间范围'
  }

  return `${start.format('YYYY-MM-DD')} ~ ${end.format('YYYY-MM-DD')}`
}

// 导出Excel方法
const exportToExcel = () => {
  try {
    // 1. 准备数据
    const timeRange = getTimeRange()
    const excelData = shouldPayList.value.map((item) => ({
      '时间段': timeRange,
      '专家姓名': item.expertName,
      '培训项目': item.projectName,
      '劳务费用(元)': item.free,
      '截至时间': item.payDeadlineTime,
      '结清时间': item.payCompletionTime || '-',
      '状态': item.status === 0 ? '未设置费用' :
          item.status === 1 ? '未结清' :
              item.status === 2 ? '已结清' : '未知状态'
    }))

    // 2. 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: ['时间段', '专家姓名', '培训项目', '劳务费用(元)', '截至时间', '结清时间', '状态'],
      skipHeader: false,
    })

    // 3. 设置列宽
    worksheet['!cols'] = [
      { wch: 25 }, // 时间段列宽
      { wch: 15 }, // 专家姓名列宽
      { wch: 20 }, // 培训项目列宽
      { wch: 15 }, // 劳务费用列宽
      { wch: 20 }, // 截至时间列宽
      { wch: 20 }, // 结清时间列宽
      { wch: 12 }, // 状态列宽
    ]

    // 4. 创建并写入工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '专家费用报表')

    // 5. 导出文件
    XLSX.writeFile(workbook, `专家费用_${timeRange}.xlsx`)

    Message.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.expert-container {
  padding: 16px;
  background-color: var(--color-bg-2);
  border-radius: 4px;

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      .selected-text {
        color: var(--color-text-2);
        font-size: 14px;
      }
    }

    .right {
      display: flex;
      align-items: center;

      .arco-range-picker {
        margin-right: 12px;
      }

      .arco-btn {
        flex-shrink: 0;
      }
    }
  }

  :deep(.arco-table) {
    .arco-table-th {
      background-color: var(--color-fill-2);
    }

    .arco-table-tr {
      &:hover {
        td {
          background-color: var(--color-fill-2);
        }
      }
    }

    .arco-table-td {
      padding: 12px 16px;
    }
  }

  :deep(.arco-tag) {
    min-width: 60px;
    text-align: center;
  }

  .expert-image {
    display: flex;
    justify-content: center;
    align-items: center;

    .expert-avatar {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.05);
      }
    }

    .expert-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background-color: var(--color-fill-2);
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-text-2);
      font-size: 14px;
    }
  }

  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: var(--color-fill-2);
    border-radius: 4px;
    
    .preview-image {
      max-width: 100%;
      max-height: 80vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .detail-container {
    .detail-table {
      :deep(.arco-table-th) {
        background-color: var(--color-fill-2);
        font-weight: 500;
      }

      :deep(.arco-table-td) {
        padding: 16px;
      }

      .status-tag {
        min-width: 80px;
        text-align: center;
      }

      :deep(.arco-btn) {
        padding: 4px 12px;
        font-size: 13px;
      }
    }

    .empty-table {
      padding: 32px 0;
      text-align: center;
      color: var(--color-text-3);

      .icon-exclamation-circle {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }
  }

  .upload-wrapper {
    :deep(.arco-upload-list-item) {
      width: 160px;
      height: 160px;
      margin-right: 12px;
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s;
      border: 1px solid var(--color-border);

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      .arco-upload-list-item-picture {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .arco-upload-list-item-actions {
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }

    .upload-trigger {
      width: 160px;
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: var(--color-fill-2);

      &:hover {
        border-color: rgb(var(--primary-6));
        background-color: var(--color-fill-3);
        transform: scale(1.02);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      .icon-plus {
        font-size: 32px;
        color: var(--color-text-3);
        margin-bottom: 12px;
      }

      .upload-text {
        font-size: 16px;
        color: var(--color-text-3);
        font-weight: 500;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .set-fee-container {
    .project-info {
      margin-bottom: 24px;
      padding: 12px;
      background-color: var(--color-fill-2);
      border-radius: 4px;

      .label {
        color: var(--color-text-2);
        margin-right: 8px;
      }

      .value {
        color: var(--color-text-1);
        font-weight: 500;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  }
}

.form-actions {
  margin-left: 40px;
}

.form-actions button {
  margin-right: 5px;
}
</style>
