<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="课程名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入课程名称" />
      </el-form-item>
      <el-form-item label="课程分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择课程分类" class="!w-full">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程封面" prop="coverUrl">
        <UploadImg v-model="formData.coverUrl" :limit="1" />
      </el-form-item>
      <el-form-item label="授课老师" prop="teacherName">
        <el-input v-model="formData.teacherName" placeholder="请输入授课老师姓名" />
      </el-form-item>
      <el-form-item label="课程价格" prop="price">
        <el-input-number
          v-model="formData.price"
          :min="0"
          :precision="2"
          :step="1"
          placeholder="0 表示免费"
        />
        <span class="ml-5px text-gray-500 text-12px">分（填 0 为免费课程）</span>
      </el-form-item>
      <el-form-item label="原价" prop="originalPrice">
        <el-input-number v-model="formData.originalPrice" :min="0" :precision="2" :step="1" />
        <span class="ml-5px text-gray-500 text-12px">分</span>
      </el-form-item>
      <el-form-item label="有效天数" prop="validDays">
        <el-input-number v-model="formData.validDays" :min="0" />
        <span class="ml-5px text-gray-500 text-12px">天（0 表示永久有效）</span>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" />
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input
          type="textarea"
          v-model="formData.introduction"
          placeholder="请输入课程简介"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as CourseApi from '@/api/edu/course'
import { UploadImg } from '@/components/UploadFile'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const categoryList = ref<any[]>([])

const formData = ref({
  id: undefined as number | undefined,
  name: '',
  categoryId: undefined as number | undefined,
  coverUrl: undefined as string | undefined,
  teacherName: '',
  price: 0,
  originalPrice: 0,
  validDays: 0,
  sort: 0,
  introduction: '',
  status: 0
})
const formRules = reactive({
  name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '课程分类不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  const data = await CourseApi.getCourseCategoryList()
  categoryList.value = data
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CourseApi.getCourse(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as unknown as CourseApi.CourseVO
    if (formType.value === 'create') {
      await CourseApi.createCourse(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseApi.updateCourse(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    categoryId: undefined,
    coverUrl: undefined,
    teacherName: '',
    price: 0,
    originalPrice: 0,
    validDays: 0,
    sort: 0,
    introduction: '',
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
