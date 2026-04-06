import request from '@/config/axios'

export interface JobVO {
  id?: number
  name: string
  categoryId?: number
  categoryName?: string
  areaId?: number
  areaName?: string
  education?: number
  experience?: number
  salaryMin?: number
  salaryMax?: number
  headCount?: number
  description?: string
  requirement?: string
  status?: number
  sort?: number
  createTime?: Date
  applicantCount?: number
}

export interface JobCategoryVO {
  id?: number
  name: string
  parentId?: number
  sort?: number
  status?: number
}

// ========================= 职位分类 =========================

// 查询职位分类列表
export const getJobCategoryList = async (params?: any) => {
  return await request.get({ url: `/recruit/job-category/list`, params })
}

// 查询职位分类详情
export const getJobCategory = async (id: number) => {
  return await request.get({ url: `/recruit/job-category/get?id=` + id })
}

// 新增职位分类
export const createJobCategory = async (data: JobCategoryVO) => {
  return await request.post({ url: `/recruit/job-category/create`, data })
}

// 修改职位分类
export const updateJobCategory = async (data: JobCategoryVO) => {
  return await request.put({ url: `/recruit/job-category/update`, data })
}

// 删除职位分类
export const deleteJobCategory = async (id: number) => {
  return await request.delete({ url: `/recruit/job-category/delete?id=` + id })
}

// ========================= 职位 =========================

// 查询职位分页列表
export const getJobPage = async (params: any) => {
  return await request.get({ url: `/recruit/job/page`, params })
}

// 查询职位详情
export const getJob = async (id: number) => {
  return await request.get({ url: `/recruit/job/get?id=` + id })
}

// 新增职位
export const createJob = async (data: JobVO) => {
  return await request.post({ url: `/recruit/job/create`, data })
}

// 修改职位
export const updateJob = async (data: JobVO) => {
  return await request.put({ url: `/recruit/job/update`, data })
}

// 删除职位
export const deleteJob = async (id: number) => {
  return await request.delete({ url: `/recruit/job/delete?id=` + id })
}

// 修改职位状态
export const updateJobStatus = async (id: number, status: number) => {
  return await request.put({ url: `/recruit/job/update-status`, data: { id, status } })
}

// 获取职位简单列表（用于下拉）
export const getSimpleJobList = async () => {
  return await request.get({ url: `/recruit/job/list-all-simple` })
}
