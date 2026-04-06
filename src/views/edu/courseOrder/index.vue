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
      <el-form-item label="订单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
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
      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态"
          clearable
          class="!w-240px"
        >
          <el-option label="未支付" :value="false" />
          <el-option label="已支付" :value="true" />
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
      <el-table-column label="订单编号" align="center" prop="id" width="80" />
      <el-table-column label="订单号" align="center" prop="no" min-width="160" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" width="120" />
      <el-table-column label="课程名称" align="center" prop="courseName" min-width="150" />
      <el-table-column label="价格(元)" align="center" prop="price" width="100">
        <template #default="scope">
          ¥{{ scope.row.price ? (scope.row.price / 100).toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.payStatus ? 'success' : 'warning'">
            {{ scope.row.payStatus ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="支付时间"
        align="center"
        prop="payTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.payStatus"
            link
            type="warning"
            @click="handleRefund(scope.row.id)"
            v-hasPermi="['edu:course-order:update']"
          >
            退款
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

  <!-- 订单详情弹窗 -->
  <el-dialog v-model="detailVisible" title="订单详情" width="500px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="订单号" :span="2">{{ currentOrder?.no }}</el-descriptions-item>
      <el-descriptions-item label="用户昵称">{{ currentOrder?.userNickname }}</el-descriptions-item>
      <el-descriptions-item label="课程名称">{{ currentOrder?.courseName }}</el-descriptions-item>
      <el-descriptions-item label="支付金额">
        ¥{{ currentOrder?.price ? (currentOrder.price / 100).toFixed(2) : '0.00' }}
      </el-descriptions-item>
      <el-descriptions-item label="支付状态">
        <el-tag :type="currentOrder?.payStatus ? 'success' : 'warning'">
          {{ currentOrder?.payStatus ? '已支付' : '未支付' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="支付时间">
        {{ currentOrder?.payTime ? formatDate(currentOrder.payTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ currentOrder?.createTime ? formatDate(currentOrder.createTime) : '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts" name="EduCourseOrder">
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as RecordApi from '@/api/edu/record'

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  userNickname: undefined,
  courseName: undefined,
  payStatus: undefined,
  createTime: []
})
const queryFormRef = ref()

const detailVisible = ref(false)
const currentOrder = ref<any>(null)

const openDetail = (row: any) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleRefund = async (id: number) => {
  try {
    await message.confirm('确认要对该订单进行退款操作吗？')
    await RecordApi.refundCourseOrder(id)
    message.success('退款成功')
    await getList()
  } catch {}
}

const getList = async () => {
  loading.value = true
  try {
    const data = await RecordApi.getCourseOrderPage(queryParams)
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

onMounted(() => {
  getList()
})
</script>
