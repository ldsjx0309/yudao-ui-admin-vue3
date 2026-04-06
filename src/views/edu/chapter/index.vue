<template>
  <ContentWrap>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <el-button @click="router.back()" :icon="ArrowLeft" circle size="small" />
        <span class="text-16px font-medium">课程章节管理</span>
        <el-tag v-if="courseName" type="info">{{ courseName }}</el-tag>
      </div>
      <el-button
        type="primary"
        @click="openChapterForm('create')"
        v-hasPermi="['edu:course:update']"
      >
        <Icon icon="ep:plus" class="mr-5px" /> 添加章节
      </el-button>
    </div>

    <div v-loading="loading">
      <div v-if="chapterList.length === 0" class="py-10 text-center text-gray-400">
        暂无章节，请先添加章节
      </div>
      <el-collapse v-else v-model="activeChapters">
        <el-collapse-item
          v-for="chapter in chapterList"
          :key="chapter.id"
          :name="chapter.id"
        >
          <template #title>
            <div class="flex items-center justify-between w-full pr-4">
              <span class="font-medium">{{ chapter.name }}</span>
              <div class="flex gap-2" @click.stop>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="openSectionForm('create', chapter.id)"
                  v-hasPermi="['edu:course:update']"
                >
                  + 小节
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="openChapterForm('update', chapter.id)"
                  v-hasPermi="['edu:course:update']"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDeleteChapter(chapter.id)"
                  v-hasPermi="['edu:course:update']"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>

          <!-- 小节列表 -->
          <el-table
            :data="chapter.sections || []"
            :show-header="false"
            :stripe="false"
            class="w-full"
          >
            <el-table-column prop="name" min-width="200">
              <template #default="scope">
                <div class="flex items-center gap-2">
                  <Icon icon="ep:video-camera" class="text-gray-400" />
                  <span>{{ scope.row.name }}</span>
                  <el-tag v-if="scope.row.freeFlag" type="success" size="small">免费</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="duration" width="100" align="center">
              <template #default="scope">
                <span class="text-gray-500 text-12px">
                  {{ scope.row.duration ? formatDuration(scope.row.duration) : '-' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="browseCount" width="100" align="center">
              <template #default="scope">
                <span class="text-gray-500 text-12px">{{ scope.row.browseCount || 0 }} 次学习</span>
              </template>
            </el-table-column>
            <el-table-column width="150" align="right" fixed="right">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="openSectionForm('update', chapter.id, scope.row.id)"
                  v-hasPermi="['edu:course:update']"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDeleteSection(scope.row.id)"
                  v-hasPermi="['edu:course:update']"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>
  </ContentWrap>

  <!-- 章节表单弹窗 -->
  <el-dialog v-model="chapterDialogVisible" :title="chapterDialogTitle" width="400px">
    <el-form ref="chapterFormRef" :model="chapterForm" :rules="chapterFormRules" label-width="80px">
      <el-form-item label="章节名称" prop="name">
        <el-input v-model="chapterForm.name" placeholder="请输入章节名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="chapterForm.sort" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitChapterForm" type="primary">确 定</el-button>
      <el-button @click="chapterDialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>

  <!-- 小节表单弹窗 -->
  <el-dialog v-model="sectionDialogVisible" :title="sectionDialogTitle" width="500px">
    <el-form ref="sectionFormRef" :model="sectionForm" :rules="sectionFormRules" label-width="90px">
      <el-form-item label="小节名称" prop="name">
        <el-input v-model="sectionForm.name" placeholder="请输入小节名称" />
      </el-form-item>
      <el-form-item label="视频地址" prop="videoUrl">
        <el-input v-model="sectionForm.videoUrl" placeholder="请输入视频地址" />
      </el-form-item>
      <el-form-item label="时长(秒)" prop="duration">
        <el-input-number v-model="sectionForm.duration" :min="0" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="sectionForm.sort" :min="0" />
      </el-form-item>
      <el-form-item label="是否免费" prop="freeFlag">
        <el-switch v-model="sectionForm.freeFlag" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitSectionForm" type="primary">确 定</el-button>
      <el-button @click="sectionDialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EduCourseChapter">
import { ArrowLeft } from '@element-plus/icons-vue'
import * as ChapterApi from '@/api/edu/chapter'
import * as CourseApi from '@/api/edu/course'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const { t } = useI18n()

const courseId = Number(route.params.courseId)
const courseName = ref('')
const loading = ref(false)
const chapterList = ref<any[]>([])
const activeChapters = ref<number[]>([])

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const loadChapters = async () => {
  loading.value = true
  try {
    const chapters = await ChapterApi.getChapterList(courseId)
    // load sections for each chapter
    for (const chapter of chapters) {
      chapter.sections = await ChapterApi.getSectionList(chapter.id)
    }
    chapterList.value = chapters
    activeChapters.value = chapters.map((c: any) => c.id)
  } finally {
    loading.value = false
  }
}

// ========== 章节操作 ==========
const chapterDialogVisible = ref(false)
const chapterDialogTitle = ref('')
const chapterFormType = ref('')
const chapterForm = ref({ id: undefined as number | undefined, courseId, name: '', sort: 0 })
const chapterFormRules = { name: [{ required: true, message: '章节名称不能为空', trigger: 'blur' }] }
const chapterFormRef = ref()

const openChapterForm = (type: string, id?: number) => {
  chapterDialogVisible.value = true
  chapterDialogTitle.value = type === 'create' ? '添加章节' : '编辑章节'
  chapterFormType.value = type
  if (type === 'create') {
    chapterForm.value = { id: undefined, courseId, name: '', sort: 0 }
  } else if (id) {
    const chapter = chapterList.value.find((c) => c.id === id)
    if (chapter) chapterForm.value = { ...chapter }
  }
}

const submitChapterForm = async () => {
  const valid = await chapterFormRef.value?.validate()
  if (!valid) return
  try {
    if (chapterFormType.value === 'create') {
      await ChapterApi.createChapter(chapterForm.value)
      message.success(t('common.createSuccess'))
    } else {
      await ChapterApi.updateChapter(chapterForm.value)
      message.success(t('common.updateSuccess'))
    }
    chapterDialogVisible.value = false
    await loadChapters()
  } catch {}
}

const handleDeleteChapter = async (id: number) => {
  try {
    await message.delConfirm()
    await ChapterApi.deleteChapter(id)
    message.success(t('common.delSuccess'))
    await loadChapters()
  } catch {}
}

// ========== 小节操作 ==========
const sectionDialogVisible = ref(false)
const sectionDialogTitle = ref('')
const sectionFormType = ref('')
const sectionForm = ref({
  id: undefined as number | undefined,
  chapterId: 0,
  courseId,
  name: '',
  videoUrl: '',
  duration: 0,
  sort: 0,
  freeFlag: false
})
const sectionFormRules = { name: [{ required: true, message: '小节名称不能为空', trigger: 'blur' }] }
const sectionFormRef = ref()

const openSectionForm = (type: string, chapterId: number, sectionId?: number) => {
  sectionDialogVisible.value = true
  sectionDialogTitle.value = type === 'create' ? '添加小节' : '编辑小节'
  sectionFormType.value = type
  if (type === 'create') {
    sectionForm.value = {
      id: undefined,
      chapterId,
      courseId,
      name: '',
      videoUrl: '',
      duration: 0,
      sort: 0,
      freeFlag: false
    }
  } else if (sectionId) {
    const chapter = chapterList.value.find((c) => c.id === chapterId)
    const section = chapter?.sections?.find((s: any) => s.id === sectionId)
    if (section) sectionForm.value = { ...section }
  }
}

const submitSectionForm = async () => {
  const valid = await sectionFormRef.value?.validate()
  if (!valid) return
  try {
    if (sectionFormType.value === 'create') {
      await ChapterApi.createSection(sectionForm.value)
      message.success(t('common.createSuccess'))
    } else {
      await ChapterApi.updateSection(sectionForm.value)
      message.success(t('common.updateSuccess'))
    }
    sectionDialogVisible.value = false
    await loadChapters()
  } catch {}
}

const handleDeleteSection = async (id: number) => {
  try {
    await message.delConfirm()
    await ChapterApi.deleteSection(id)
    message.success(t('common.delSuccess'))
    await loadChapters()
  } catch {}
}

onMounted(async () => {
  try {
    const course = await CourseApi.getCourse(courseId)
    courseName.value = course?.name || ''
  } catch {}
  await loadChapters()
})
</script>
