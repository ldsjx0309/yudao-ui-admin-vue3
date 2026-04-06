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
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入真实姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="求职状态" prop="jobStatus">
        <el-select
          v-model="queryParams.jobStatus"
          placeholder="请选择求职状态"
          clearable
          class="!w-240px"
        >
          <el-option label="在职，随时到岗" :value="0" />
          <el-option label="在职，考虑机会" :value="1" />
          <el-option label="离职，随时到岗" :value="2" />
          <el-option label="暂不考虑" :value="3" />
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
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" width="120" />
      <el-table-column label="真实姓名" align="center" prop="realName" width="100" />
      <el-table-column label="手机号" align="center" prop="mobile" width="130" />
      <el-table-column label="当前城市" align="center" prop="currentCity" width="100" />
      <el-table-column label="当前职位" align="center" prop="currentPosition" min-width="120" />
      <el-table-column label="期望薪资" align="center" width="140">
        <template #default="scope">
          {{ formatSalaryRange(scope.row.expectedSalaryMin, scope.row.expectedSalaryMax) }}
        </template>
      </el-table-column>
      <el-table-column label="求职状态" align="center" prop="jobStatus" width="130">
        <template #default="scope">
          <el-tag :type="getJobStatusTagType(scope.row.jobStatus)" size="small">
            {{ getJobStatusLabel(scope.row.jobStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
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

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" title="简历详情" width="700px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="用户昵称">{{ currentResume?.userNickname }}</el-descriptions-item>
      <el-descriptions-item label="真实姓名">{{ currentResume?.realName }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ currentResume?.mobile }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ currentResume?.email }}</el-descriptions-item>
      <el-descriptions-item label="当前城市">{{ currentResume?.currentCity }}</el-descriptions-item>
      <el-descriptions-item label="当前职位">{{ currentResume?.currentPosition }}</el-descriptions-item>
      <el-descriptions-item label="期望薪资">
        {{ formatSalaryRange(currentResume?.expectedSalaryMin, currentResume?.expectedSalaryMax) }}
      </el-descriptions-item>
      <el-descriptions-item label="期望城市">{{ currentResume?.expectedCity }}</el-descriptions-item>
      <el-descriptions-item label="期望职位">{{ currentResume?.expectedPosition }}</el-descriptions-item>
      <el-descriptions-item label="求职状态">
        {{ getJobStatusLabel(currentResume?.jobStatus) }}
      </el-descriptions-item>
      <el-descriptions-item label="技能标签" :span="2">{{ currentResume?.skills }}</el-descriptions-item>
      <el-descriptions-item label="自我介绍" :span="2">{{ currentResume?.selfIntro }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts" name="MemberResume">
import { dateFormatter } from '@/utils/formatTime'
import * as ResumeApi from '@/api/member/resume'
import { getJobStatusLabel, getJobStatusTagType, formatSalaryRange } from '@/utils/recruitStatus'

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  realName: undefined,
  mobile: undefined,
  jobStatus: undefined,
  createTime: []
})
const queryFormRef = ref()

const detailVisible = ref(false)
const currentResume = ref<any>(null)

const getList = async () => {
  loading.value = true
  try {
    const data = await ResumeApi.getResumePage(queryParams)
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

const openDetail = (row: any) => {
  currentResume.value = row
  detailVisible.value = true
}

onMounted(() => {
  getList()
})
</script>
