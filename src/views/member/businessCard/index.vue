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
      <el-form-item label="公司名称" prop="company">
        <el-input
          v-model="queryParams.company"
          placeholder="请输入公司名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
      <el-table-column label="头像" align="center" prop="avatar" width="80">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" :size="40" />
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" align="center" prop="realName" width="100" />
      <el-table-column label="公司" align="center" prop="company" min-width="150" />
      <el-table-column label="职位" align="center" prop="position" width="120" />
      <el-table-column label="手机号" align="center" prop="mobile" width="130" />
      <el-table-column label="邮箱" align="center" prop="email" min-width="160" />
      <el-table-column label="微信" align="center" prop="wechat" width="130" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['member:business-card:delete']"
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

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" title="名片详情" width="500px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="头像" :span="2">
        <el-avatar :src="currentCard?.avatar" :size="60" />
      </el-descriptions-item>
      <el-descriptions-item label="姓名">{{ currentCard?.realName }}</el-descriptions-item>
      <el-descriptions-item label="职位">{{ currentCard?.position }}</el-descriptions-item>
      <el-descriptions-item label="公司" :span="2">{{ currentCard?.company }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ currentCard?.mobile }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ currentCard?.email }}</el-descriptions-item>
      <el-descriptions-item label="微信">{{ currentCard?.wechat }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ currentCard?.address }}</el-descriptions-item>
      <el-descriptions-item label="简介" :span="2">{{ currentCard?.intro }}</el-descriptions-item>
      <el-descriptions-item label="二维码" :span="2">
        <img v-if="currentCard?.qrCodeUrl" :src="currentCard?.qrCodeUrl" class="w-100px h-100px" />
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts" name="MemberBusinessCard">
import { dateFormatter } from '@/utils/formatTime'
import * as ResumeApi from '@/api/member/resume'

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  realName: undefined,
  company: undefined,
  createTime: []
})
const queryFormRef = ref()

const detailVisible = ref(false)
const currentCard = ref<any>(null)

const getList = async () => {
  loading.value = true
  try {
    const data = await ResumeApi.getBusinessCardPage(queryParams)
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
  currentCard.value = row
  detailVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ResumeApi.deleteBusinessCard(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
