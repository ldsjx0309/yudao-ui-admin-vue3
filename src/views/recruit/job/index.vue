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
      <el-form-item label="职位名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入职位名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
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
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['recruit:job:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="职位名称" align="center" prop="name" min-width="150" />
      <el-table-column label="分类" align="center" prop="categoryName" width="120" />
      <el-table-column label="工作地点" align="center" prop="areaName" width="120" />
      <el-table-column label="学历要求" align="center" prop="education" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.EDU_EDUCATION" :value="scope.row.education" />
        </template>
      </el-table-column>
      <el-table-column label="薪资范围" align="center" width="130">
        <template #default="scope">
          {{ formatSalaryRange(scope.row.salaryMin, scope.row.salaryMax) }}
        </template>
      </el-table-column>
      <el-table-column label="招聘人数" align="center" prop="headCount" width="90" />
      <el-table-column label="投递人数" align="center" prop="applicantCount" width="90" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
            v-hasPermi="['recruit:job:update']"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['recruit:job:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleApplicationList(scope.row.id)"
            v-hasPermi="['recruit:application:query']"
          >
            投递记录
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['recruit:job:delete']"
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

  <!-- 表单弹窗：添加/修改 -->
  <JobForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts" name="RecruitJob">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as JobApi from '@/api/recruit/job'
import JobForm from './JobForm.vue'
import { formatSalaryRange } from '@/utils/recruitStatus'

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await JobApi.getJobPage(queryParams)
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
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleApplicationList = (jobId: number) => {
  router.push({ path: '/recruit/application', query: { jobId } })
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await JobApi.deleteJob(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleStatusChange = async (row: any) => {
  try {
    await JobApi.updateJobStatus(row.id, row.status)
    message.success('状态修改成功')
  } catch {
    row.status = row.status === 0 ? 1 : 0
  }
}

onMounted(() => {
  getList()
})
</script>
