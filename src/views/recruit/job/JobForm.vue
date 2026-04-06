<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="700px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="职位名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入职位名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择职位分类" class="!w-full">
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学历要求" prop="education">
            <el-select v-model="formData.education" placeholder="请选择学历要求" class="!w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.EDU_EDUCATION)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工作经验" prop="experience">
            <el-select v-model="formData.experience" placeholder="请选择工作经验" class="!w-full">
              <el-option label="不限" :value="0" />
              <el-option label="1年以内" :value="1" />
              <el-option label="1-3年" :value="2" />
              <el-option label="3-5年" :value="3" />
              <el-option label="5-10年" :value="4" />
              <el-option label="10年以上" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资下限(K)" prop="salaryMin">
            <el-input-number v-model="formData.salaryMin" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资上限(K)" prop="salaryMax">
            <el-input-number v-model="formData.salaryMax" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="招聘人数" prop="headCount">
            <el-input-number v-model="formData.headCount" :min="1" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="职位描述" prop="description">
            <el-input
              type="textarea"
              v-model="formData.description"
              placeholder="请输入职位描述"
              :rows="4"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="职位要求" prop="requirement">
            <el-input
              type="textarea"
              v-model="formData.requirement"
              placeholder="请输入职位要求"
              :rows="4"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
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
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as JobApi from '@/api/recruit/job'

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
  education: undefined as number | undefined,
  experience: undefined as number | undefined,
  salaryMin: undefined as number | undefined,
  salaryMax: undefined as number | undefined,
  headCount: 1,
  description: '',
  requirement: '',
  sort: 0,
  status: 0
})
const formRules = reactive({
  name: [{ required: true, message: '职位名称不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  const data = await JobApi.getJobCategoryList()
  categoryList.value = data
  if (id) {
    formLoading.value = true
    try {
      formData.value = await JobApi.getJob(id)
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
    const data = formData.value as unknown as JobApi.JobVO
    if (formType.value === 'create') {
      await JobApi.createJob(data)
      message.success(t('common.createSuccess'))
    } else {
      await JobApi.updateJob(data)
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
    education: undefined,
    experience: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    headCount: 1,
    description: '',
    requirement: '',
    sort: 0,
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
