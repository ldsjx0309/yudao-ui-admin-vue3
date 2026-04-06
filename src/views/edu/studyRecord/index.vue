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
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="学习时间" prop="createTime">
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
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['edu:study-record:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" width="120" />
      <el-table-column label="课程名称" align="center" prop="courseName" min-width="150" />
      <el-table-column label="小节名称" align="center" prop="sectionName" min-width="120" />
      <el-table-column label="学习时长(秒)" align="center" prop="duration" width="120" />
      <el-table-column label="进度(%)" align="center" prop="progress" width="90" />
      <el-table-column
        label="完成时间"
        align="center"
        prop="finishTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="记录时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts" name="EduStudyRecord">
import { dateFormatter } from '@/utils/formatTime'
import * as RecordApi from '@/api/edu/record'
import download from '@/utils/download'

const message = useMessage()
const exportLoading = ref(false)

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userNickname: undefined,
  courseName: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await RecordApi.getStudyRecordPage(queryParams)
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

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await RecordApi.exportStudyRecord(queryParams)
    download.excel(data, '学习记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
