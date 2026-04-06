import request from '@/config/axios'

export interface ResumeVO {
  id?: number
  userId?: number
  realName?: string
  avatar?: string
  mobile?: string
  email?: string
  birthday?: Date
  sex?: number
  currentCity?: string
  currentPosition?: string
  selfIntro?: string
  jobStatus?: number
  expectedSalaryMin?: number
  expectedSalaryMax?: number
  expectedCity?: string
  expectedPosition?: string
  education?: number
  workYears?: number
  skills?: string
  createTime?: Date
  updateTime?: Date
  // 冗余
  userNickname?: string
}

export interface BusinessCardVO {
  id?: number
  userId?: number
  realName?: string
  avatar?: string
  company?: string
  position?: string
  mobile?: string
  email?: string
  wechat?: string
  address?: string
  intro?: string
  qrCodeUrl?: string
  createTime?: Date
}

// ========================= 简历 =========================

// 查询简历分页列表
export const getResumePage = async (params: any) => {
  return await request.get({ url: `/member/resume/page`, params })
}

// 查询简历详情
export const getResume = async (id: number) => {
  return await request.get({ url: `/member/resume/get?id=` + id })
}

// 修改简历状态
export const updateResumeStatus = async (id: number, status: number) => {
  return await request.put({ url: `/member/resume/update-status`, data: { id, status } })
}

// ========================= 名片 =========================

// 查询名片分页列表
export const getBusinessCardPage = async (params: any) => {
  return await request.get({ url: `/member/business-card/page`, params })
}

// 查询名片详情
export const getBusinessCard = async (id: number) => {
  return await request.get({ url: `/member/business-card/get?id=` + id })
}

// 删除名片
export const deleteBusinessCard = async (id: number) => {
  return await request.delete({ url: `/member/business-card/delete?id=` + id })
}
