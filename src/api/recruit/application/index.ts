import request from '@/config/axios'

export interface ApplicationVO {
  id?: number
  userId?: number
  jobId?: number
  resumeId?: number
  status?: number
  remark?: string
  createTime?: Date
  updateTime?: Date
  // 冗余字段
  userNickname?: string
  userMobile?: string
  userAvatar?: string
  jobName?: string
  categoryName?: string
}

// 查询投递记录分页列表
export const getApplicationPage = async (params: any) => {
  return await request.get({ url: `/recruit/application/page`, params })
}

// 查询投递记录详情
export const getApplication = async (id: number) => {
  return await request.get({ url: `/recruit/application/get?id=` + id })
}

// 修改投递状态（审核）
export const updateApplicationStatus = async (id: number, status: number, remark?: string) => {
  return await request.put({
    url: `/recruit/application/update-status`,
    data: { id, status, remark }
  })
}

// 删除投递记录
export const deleteApplication = async (id: number) => {
  return await request.delete({ url: `/recruit/application/delete?id=` + id })
}

// 导出投递记录
export const exportApplication = async (params: any) => {
  return await request.download({ url: `/recruit/application/export-excel`, params })
}
