<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="用户昵称" prop="userNickname">
        <el-input
          v-model="queryParams.userNickname"
          placeholder="请输入用户昵称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="职位名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入职位名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="投递状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择投递状态"
          clearable
          class="!w-240px"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已拒绝" :value="2" />
          <el-option label="已邀约" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="投递时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" width="120" />
      <el-table-column label="手机号" align="center" prop="userMobile" width="130" />
      <el-table-column label="职位名称" align="center" prop="jobName" min-width="150" />
      <el-table-column label="职位分类" align="center" prop="categoryName" width="120" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getApplicationStatusTagType(scope.row.status)">
            {{ getApplicationStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="120" />
      <el-table-column
        label="投递时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 0"
            link
            type="success"
            @click="handleUpdateStatus(scope.row, 1)"
            v-hasPermi="['recruit:application:update']"
          >
            通过
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            link
            type="danger"
            @click="handleUpdateStatus(scope.row, 2)"
            v-hasPermi="['recruit:application:update']"
          >
            拒绝
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            link
            type="primary"
            @click="handleUpdateStatus(scope.row, 3)"
            v-hasPermi="['recruit:application:update']"
          >
            邀约面试
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['recruit:application:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 审核弹窗 -->
  <el-dialog v-model="reviewDialogVisible" title="审核备注" width="400px">
    <el-form :model="reviewForm" label-width="80px">
      <el-form-item label="备注">
        <el-input
          type="textarea"
          v-model="reviewForm.remark"
          placeholder="请输入审核备注（可选）"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitReview" type="primary">确 定</el-button>
      <el-button @click="reviewDialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="RecruitApplication">
import { dateFormatter } from '@/utils/formatTime'
import * as ApplicationApi from '@/api/recruit/application'
import { getApplicationStatusLabel, getApplicationStatusTagType } from '@/utils/recruitStatus'

const message = useMessage()
const { t } = useI18n()
const route = useRoute()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userNickname: undefined as string | undefined,
  jobName: undefined as string | undefined,
  jobId: route.query.jobId ? Number(route.query.jobId) : undefined,
  status: undefined as number | undefined,
  createTime: [] as string[]
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await ApplicationApi.getApplicationPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.jobId = undefined
  handleQuery()
}

// 审核相关
const reviewDialogVisible = ref(false)
const reviewForm = reactive({ id: 0, status: 0, remark: '' })

const handleUpdateStatus = (row: any, status: number) => {
  reviewForm.id = row.id
  reviewForm.status = status
  reviewForm.remark = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  try {
    await ApplicationApi.updateApplicationStatus(reviewForm.id, reviewForm.status, reviewForm.remark)
    message.success('操作成功')
    reviewDialogVisible.value = false
    await getList()
  } catch {}
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ApplicationApi.deleteApplication(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
