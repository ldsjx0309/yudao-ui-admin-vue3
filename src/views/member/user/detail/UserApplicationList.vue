<template>
  <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
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
import * as ApplicationApi from '@/api/recruit/application'
import { getApplicationStatusLabel, getApplicationStatusTagType } from '@/utils/recruitStatus'

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
    const data = await ApplicationApi.getApplicationPage(queryParams)
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
