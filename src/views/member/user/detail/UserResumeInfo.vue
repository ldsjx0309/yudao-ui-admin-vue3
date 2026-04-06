<template>
  <div>
    <el-empty v-if="!resume" description="该用户暂未填写简历" />
    <el-descriptions v-else :column="2" border>
      <el-descriptions-item label="真实姓名">{{ resume.realName }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ resume.mobile }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ resume.email }}</el-descriptions-item>
      <el-descriptions-item label="性别">
        <dict-tag :type="DICT_TYPE.SYSTEM_USER_SEX" :value="resume.sex" />
      </el-descriptions-item>
      <el-descriptions-item label="当前城市">{{ resume.currentCity }}</el-descriptions-item>
      <el-descriptions-item label="当前职位">{{ resume.currentPosition }}</el-descriptions-item>
      <el-descriptions-item label="期望薪资">
        <span v-if="resume.expectedSalaryMin || resume.expectedSalaryMax">
          {{ resume.expectedSalaryMin }}K - {{ resume.expectedSalaryMax }}K
        </span>
        <span v-else>未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="期望城市">{{ resume.expectedCity }}</el-descriptions-item>
      <el-descriptions-item label="期望职位">{{ resume.expectedPosition }}</el-descriptions-item>
      <el-descriptions-item label="求职状态">
        <el-tag :type="getJobStatusTagType(resume.jobStatus)">
          {{ getJobStatusLabel(resume.jobStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="工作年限">{{ resume.workYears }} 年</el-descriptions-item>
      <el-descriptions-item label="学历">{{ resume.education }}</el-descriptions-item>
      <el-descriptions-item label="技能标签" :span="2">{{ resume.skills }}</el-descriptions-item>
      <el-descriptions-item label="自我介绍" :span="2">{{ resume.selfIntro }}</el-descriptions-item>
      <el-descriptions-item label="更新时间" :span="2">
        {{ resume.updateTime ? dateFormatter(null, null, resume.updateTime) : '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as ResumeApi from '@/api/member/resume'
import { getJobStatusLabel, getJobStatusTagType } from '@/utils/recruitStatus'

const props = defineProps<{ userId: number | string }>()

const resume = ref<ResumeApi.ResumeVO | null>(null)

onMounted(async () => {
  try {
    const data = await ResumeApi.getResumePage({ pageNo: 1, pageSize: 1, userId: props.userId })
    resume.value = data.list?.[0] || null
  } catch {
    resume.value = null
  }
})
</script>
