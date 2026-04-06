<template>
  <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
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
  <Pagination
    :total="total"
    v-model:page="queryParams.pageNo"
    v-model:limit="queryParams.pageSize"
    @pagination="getList"
  />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as RecordApi from '@/api/edu/record'

const props = defineProps<{ userId: number | string }>()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: props.userId
})

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

onMounted(() => {
  getList()
})
</script>
