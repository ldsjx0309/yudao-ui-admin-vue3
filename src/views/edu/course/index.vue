<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="课程名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择课程分类"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
          v-hasPermi="['edu:course:create']"
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
      <el-table-column label="课程封面" align="center" prop="coverUrl" width="90">
        <template #default="scope">
          <img
            v-if="scope.row.coverUrl"
            :src="scope.row.coverUrl"
            alt="封面"
            class="h-50px w-70px object-cover rounded"
          />
        </template>
      </el-table-column>
      <el-table-column label="课程名称" align="center" prop="name" min-width="150" />
      <el-table-column label="分类" align="center" prop="categoryName" width="120" />
      <el-table-column label="授课老师" align="center" prop="teacherName" width="100" />
      <el-table-column label="价格(元)" align="center" prop="price" width="100">
        <template #default="scope">
          <span v-if="scope.row.price && scope.row.price > 0">
            ¥{{ (scope.row.price / 100).toFixed(2) }}
          </span>
          <el-tag v-else type="success" size="small">免费</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="学习人数" align="center" prop="studyCount" width="90" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
            v-hasPermi="['edu:course:update']"
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
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['edu:course:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleChapter(scope.row.id)"
            v-hasPermi="['edu:course:update']"
          >
            章节
          </el-button>
          <el-button link type="primary" @click="handleCourseOrder(scope.row)">订单</el-button>
          <el-button link type="primary" @click="handleStudyRecord(scope.row)">学习</el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['edu:course:delete']"
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
  <CourseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts" name="EduCourse">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as CourseApi from '@/api/edu/course'
import CourseForm from './CourseForm.vue'

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const categoryList = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  categoryId: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await CourseApi.getCoursePage(queryParams)
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

const handleChapter = (courseId: number) => {
  router.push({ path: `/edu/course/${courseId}/chapter` })
}

const handleCourseOrder = (row: any) => {
  router.push({
    path: '/edu/course-order',
    query: {
      courseId: row.id,
      courseName: row.name
    }
  })
}

const handleStudyRecord = (row: any) => {
  router.push({
    path: '/edu/study-record',
    query: {
      courseId: row.id,
      courseName: row.name
    }
  })
}

const handleStatusChange = async (row: any) => {
  try {
    await CourseApi.updateCourseStatus(row.id, row.status)
    message.success('状态修改成功')
  } catch {
    // 恢复原状态
    row.status = row.status === 0 ? 1 : 0
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CourseApi.deleteCourse(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  const data = await CourseApi.getCourseCategoryList()
  categoryList.value = data
  getList()
})
</script>
