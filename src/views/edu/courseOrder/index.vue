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
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="queryParams.courseId"
          placeholder="请选择课程"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
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
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['edu:course-order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
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
      <el-table-column label="商户单号" align="center" prop="merchantOrderId" min-width="160" />
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
      <el-table-column label="操作" align="center" width="240" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.payOrderId || scope.row.merchantOrderId"
            link
            type="primary"
            @click="openPayOrder(scope.row)"
          >
            支付单
          </el-button>
          <el-button
            v-if="scope.row.payStatus"
            link
            type="primary"
            @click="openStudyRecord(scope.row)"
          >
            学习记录
          </el-button>
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
    <el-descriptions :column="2" border v-loading="detailLoading">
      <el-descriptions-item label="订单号" :span="2">{{
        currentOrder?.no || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="商户单号">
        {{ currentOrder?.merchantOrderId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="支付单号">
        {{ currentOrder?.payOrderNo || currentOrder?.payOrderId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="用户昵称">{{
        currentOrder?.userNickname || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="课程名称">{{
        currentOrder?.courseName || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="支付金额">
        ¥{{ currentOrder?.price ? (currentOrder.price / 100).toFixed(2) : '0.00' }}
      </el-descriptions-item>
      <el-descriptions-item label="支付状态">
        <el-tag :type="currentOrder?.payStatus ? 'success' : 'warning'">
          {{ currentOrder?.payStatus ? '已支付' : '未支付' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="订单状态">
        {{ currentOrder?.statusName ?? currentOrder?.status ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="授权状态">
        {{ currentOrder?.accessStatusName ?? currentOrder?.accessStatus ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="有效天数">
        {{
          currentOrder?.validDays === undefined
            ? '-'
            : currentOrder.validDays === 0
              ? '永久有效'
              : `${currentOrder.validDays} 天`
        }}
      </el-descriptions-item>
      <el-descriptions-item label="有效期截止">
        {{ currentOrder?.validEndTime ? formatDate(currentOrder.validEndTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="支付时间">
        {{ currentOrder?.payTime ? formatDate(currentOrder.payTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="退款时间">
        {{ currentOrder?.refundTime ? formatDate(currentOrder.refundTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="退款金额">
        ¥{{ currentOrder?.refundPrice ? (currentOrder.refundPrice / 100).toFixed(2) : '0.00' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ currentOrder?.createTime ? formatDate(currentOrder.createTime) : '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <PayOrderDetail ref="payOrderDetailRef" />
</template>

<script setup lang="ts" name="EduCourseOrder">
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as CourseApi from '@/api/edu/course'
import * as RecordApi from '@/api/edu/record'
import download from '@/utils/download'
import PayOrderDetail from '@/views/pay/order/OrderDetail.vue'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const exportLoading = ref(false)

const loading = ref(true)
const total = ref(0)
const list = ref<RecordApi.CourseOrderVO[]>([])
const courseList = ref<Array<{ id: number; name: string }>>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseId: undefined as number | undefined,
  no: undefined,
  userNickname: undefined as string | undefined,
  courseName: undefined as string | undefined,
  payStatus: undefined as boolean | undefined,
  createTime: []
})
const queryFormRef = ref()

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentOrder = ref<RecordApi.CourseOrderVO | null>(null)
const payOrderDetailRef = ref()

const parseQueryNumber = (value: unknown) => {
  const target = Array.isArray(value) ? value[0] : value
  if (target === undefined || target === null || target === '') {
    return undefined
  }
  const numberValue = Number(target)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

const initQueryParams = () => {
  queryParams.courseId = parseQueryNumber(route.query.courseId)
  queryParams.courseName = (
    Array.isArray(route.query.courseName) ? route.query.courseName[0] : route.query.courseName
  ) as string | undefined
  queryParams.userNickname = (
    Array.isArray(route.query.userNickname) ? route.query.userNickname[0] : route.query.userNickname
  ) as string | undefined
}

const openDetail = async (row: RecordApi.CourseOrderVO) => {
  detailVisible.value = true
  detailLoading.value = true
  try {
    currentOrder.value = await RecordApi.getCourseOrder(row.id!)
  } finally {
    detailLoading.value = false
  }
}

const openPayOrder = (row: RecordApi.CourseOrderVO) => {
  if (row.payOrderId) {
    payOrderDetailRef.value.open(row.payOrderId)
    return
  }
  if (row.merchantOrderId) {
    router.push({
      path: '/pay/order',
      query: {
        merchantOrderId: row.merchantOrderId
      }
    })
  }
}

const openStudyRecord = (row: RecordApi.CourseOrderVO) => {
  router.push({
    path: '/edu/study-record',
    query: {
      courseId: row.courseId,
      courseName: row.courseName,
      userId: row.userId,
      userNickname: row.userNickname
    }
  })
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

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await RecordApi.exportCourseOrder(queryParams)
    download.excel(data, '课程订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(async () => {
  initQueryParams()
  courseList.value = (await CourseApi.getSimpleCourseList())
    .filter((item) => item.id !== undefined && !!item.name)
    .map((item) => ({
      id: item.id!,
      name: item.name
    }))
  getList()
})
</script>
