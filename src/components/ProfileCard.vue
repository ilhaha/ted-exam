<template>
  <a-card class="profile-card">
    <div class="profile-header">
      <img
          :src="userInfo.avatar"
          class="profile-image"
      />
      <h3 class="profile-name">{{ userInfo.nickName}}</h3>
    </div>
    <a-divider/>
    <div class="profile-info">
      <!-- <div class="info-item">
        <icon-user/>
        职位：<span class="info-text">{{ userInfo.position }}</span>
      </div> -->
      <div class="info-item">
        <icon-phone/>
        手机号：<span class="info-text">{{ userInfo.phoneNumber }}</span>
      </div>
      <!-- <div class="info-item">
        <icon-email/>
        邮箱：<span class="info-text">{{ userInfo.email }}</span>
      </div> -->
      <div class="info-item">
        <icon-location/>
        部门：<span class="info-text">{{ userInfo.deptName }}</span>
      </div>
    </div>
    <a-divider/>
    <div class="profile-documents" v-if="getRoleFlag() === '1' ">
      <div class="document-header">
        <h4>资料列表</h4>
        <a-button class="document-button" type="text" @click="handleShowAllDocuments">全部资料</a-button>
      </div>
      <div class="document-list">
        <template v-if="userInfo.documentList && userInfo.documentList.length > 0">
          <a-tag
              v-for="(doc, index) in userInfo.documentList"
              :key="index"
              class="document-tag"
              size="medium"
          >
            <template #icon>
              <icon-file/>
            </template>
            {{ doc }}
          </a-tag>
        </template>
        <div v-else class="empty-text">
          暂无资料信息
        </div>
      </div>

      <!-- 修改弹窗组件 -->
      <a-modal
          :visible="showModal"
          width="70%"
          @cancel="showModal = false"
          title="全部资料"
          :footer="null"
      >
        <template #title>
          <span>全部资料</span>
          <a-button @click="handleDocUpload" style="margin-left: auto; margin-right: 30px;"> 
            <icon-file/> 
            上传资料
          </a-button>
        </template>
        <a-table :columns="columns" :data="tableData" :pagination="pagination">
          <template #documentUrl="{ record }">
            <a-image
                width="100"
                :src="record.documentUrl"
                :preview="true"
                :preview-props="{
                actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize']
              }"
            />
          </template>
        </a-table>
        <div class="pagination-wrapper">
          <a-pagination
              :total="total"
              :page-size="pageSize"
              v-model:current="currentPage"
              size="small"
              show-total
              :hide-on-single-page="false"
              @change="handlePageChange"
          />
        </div>
        <DocumentUpload
            :visible="uploadVisible"
            title="上传资料"
            @close="handleModalClose"
            @upload-success="handleUploadSuccess"
        >
        </DocumentUpload>
      </a-modal>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  IconUser,
  IconPhone,
  IconEmail,
  IconLocation,
  IconFile
} from '@arco-design/web-vue/es/icon'
import {Image, Message} from '@arco-design/web-vue'
import {getRole} from "@/apis";
import {getRoleFlag} from "@/utils/auth";
import {ref, onMounted} from 'vue';
import {listDocument, type DocumentPageQuery} from '@/apis/File/upload'; // 引入 listDocument 方法
import {h} from 'vue'
import DocumentUpload from "@/components/DocumentUpload/index.vue";
import {studentUploadDocuments} from "@/apis/document";
import { getStudentInfo } from '@/apis/studentInfo/student'

// 定义弹窗显示状态
const showModal = ref(false);
const uploadVisible = ref(false)
// 定义表格列
// 定义审核状态映射
const statusMap = {
  0: { text: '未审核', color: '#3498db', bgColor: '#e1f0fa' },
  1: { text: '已通过', color: '#2ecc71', bgColor: '#e8f8f0' },
  2: { text: '未通过', color: '#e74c3c', bgColor: '#fdedec' }
};

// 修改表格列定义
const columns = [
  {
    title: '资料种类名称',
    dataIndex: 'typeName',
    key: 'typeName',
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    key: 'status',
    render: ({ record }) => {
      const status = record.status;
      const mappedStatus = statusMap[status] || { 
        text: '未知状态', 
        color: '#95a5a6', 
        bgColor: '#f2f3f4' 
      };
      return h('span', { 
        style: { 
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '4px',
          color: mappedStatus.color,
          backgroundColor: mappedStatus.bgColor,
          border: `1px solid ${mappedStatus.color}`
        } 
      }, mappedStatus.text);
    },
  },
  {
    title: '审核日期',
    dataIndex: 'reviewTime',
    key: 'reviewTime',
  },
  {
    title: '审核人',
    dataIndex: 'reviewer',
    key: 'reviewer',
  },
  {
    title: '资料图片',
    dataIndex: 'documentUrl',
    key: 'documentUrl',
    render: ({record}) => {
      const urls = record.documentUrl ? record.documentUrl.split(',') : []
      return h('div', {class: 'image-list'},
          urls.map(url => h(Image, {
            src: url.trim(),
            width: 80,
            height: 60,
            style: {marginRight: '8px', marginBottom: '8px'},
            preview: true,
            previewProps: {
              actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize']
            }
          }))
      )
    }
  }
];
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 定义表格数据
const tableData = ref([]);

// 定义分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const handleDocUpload = () => {
  showModal.value = false;  // 先关闭全部资料弹窗
  uploadVisible.value = true;  // 再打开上传资料弹窗
}

const handleModalClose = () => {
  uploadVisible.value = false;
  showModal.value = true;  // 关闭上传弹窗后重新打开全部资料弹窗
}
const handleUploadSuccess = async (data: { docPath: string, typeId: number }) => {
  const res = await studentUploadDocuments(data)
  if(res.code == 0) {
    Message.success("提交成功")
    // 上传成功后刷新数据
    await handleShowAllDocuments();
  }
}

// 处理点击全部资料按钮
const handleShowAllDocuments = async () => {
  showModal.value = true;
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    const response = await listDocument(params);
    if (response?.data) {
      console.log('获取资料列表成功', response.data)
      tableData.value = response.data.list || []
      total.value = response.data.total || 0
    }
    ;
  } catch (error) {
    console.error('获取资料列表失败', error);
    tableData.value = []; // 清空表格数据
    total.value = 0; // 重置总记录数
  }
};
const handlePageChange = async (page: number) => {
  currentPage.value = page
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`
    const response = await listDocument(params);
    if (response?.data) {
      console.log('获取资料列表成功', response.data);
      tableData.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取资料列表失败', error);
    tableData.value = []; // 清空表格数据
    total.value = 0; // 重置总记录数
  }
}

interface UserInfo {
  avatar: string
  nickName: string
  documentList: string[]
  position: string
  phoneNumber: string
  email: string
  deptName: string
}

// 个人信息数据
const userInfo = ref<UserInfo>({
  avatar: '/static/images/test.jpg',
  nickName: '',
  documentList: [],
  position: '未设置',
  phoneNumber: '未设置',
  email: '未设置',
  deptName: '未设置'
})

const fetchUserInfo = async () => {
  try {
    const res = await getStudentInfo()
    console.log('API Response:', res)
    if (res?.data) {
      userInfo.value = {
        ...userInfo.value,
        avatar: res.data.avatar || '/static/images/test.jpg',
        nickName: res.data.nickName || '',
        documentList: res.data.documentList || [],
        phoneNumber: res.data.phoneNumber || '未设置',
        email: res.data.email || '未设置',
        deptName: res.data.deptName || '未设置'
      }
    }
  } catch (error) {
    Message.error('获取个人信息失败')
    console.error('获取个人信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})

// 确保提供默认值
const props = withDefaults(defineProps<{
  userInfo: UserInfo
}>(), {
  userInfo: () => ({
    avatar: '/static/images/test.jpg',
    nickName: '未设置',
    documentList: [],
    position: '未设置',
    phoneNumber: '未设置',
    email: '未设置',
    deptName: '未设置'
  })
})
</script>

<style scoped lang="scss">
.profile-card {
  background: var(--color-bg-2);
  border-radius: 8px;
  overflow: hidden;
}

.profile-header {
  text-align: center;
  padding: 20px 0;

  .profile-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    object-fit: cover;
    border: 2px solid #fff;
    margin-bottom: 16px;
  }

  .profile-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }
}

.profile-info {
  padding: 0 16px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--color-text-2);
    font-size: 14px;

    :deep(.arco-icon) {
      font-size: 16px;
      color: var(--color-text-3);
    }

    .info-text {
      color: var(--color-text-3);
    }
  }
}

.profile-documents {
  padding: 16px;

  h4 {
    color: var(--color-text-1);
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
  }

  .document-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .document-tag {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      background-color: var(--color-fill-2);
      border-radius: 4px;
      transition: all 0.2s;
      cursor: pointer;

      :deep(.arco-icon) {
        margin-right: 6px;
        font-size: 14px;
        color: var(--color-text-2);
      }

      &:hover {
        background-color: var(--color-fill-3);
        transform: translateY(-1px);
      }
    }

    .empty-text {
      width: 100%;
      text-align: center;
      color: var(--color-text-3);
      padding: 16px 0;
    }
  }
}

// 添加新的样式来控制标题和按钮的布局
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.document-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

:deep(.arco-image-preview-footer) {
  background-color: rgba(0, 0, 0, 0.5);
}

:deep(.arco-image-preview-actions) {
  background-color: transparent;
}
</style>