import request from '@/config/axios'

export interface StudyRecordVO {
  id?: number
  userId?: number
  courseId?: number
  sectionId?: number
  duration?: number
  progress?: number
  finishTime?: Date
  createTime?: Date
  // 冗余字段
  userNickname?: string
  courseName?: string
  sectionName?: string
}

export interface CourseOrderVO {
  id?: number
  no?: string
  merchantOrderId?: string
  payOrderId?: number
  payOrderNo?: string
  userId?: number
  courseId?: number
  price?: number
  payStatus?: boolean
  payTime?: Date
  status?: number
  statusName?: string
  refundPrice?: number
  refundTime?: Date
  validDays?: number
  validStartTime?: Date
  validEndTime?: Date
  accessStatus?: number | string
  accessStatusName?: string
  createTime?: Date
  // 冗余字段
  userNickname?: string
  userAvatar?: string
  courseName?: string
}

// ========================= 学习记录 =========================

// 查询学习记录分页列表
export const getStudyRecordPage = async (params: any) => {
  return await request.get({ url: `/edu/study-record/page`, params })
}

// 查询学习记录详情
export const getStudyRecord = async (id: number) => {
  return await request.get({ url: `/edu/study-record/get?id=` + id })
}

// ========================= 课程订单 =========================

// 查询课程订单分页列表
export const getCourseOrderPage = async (params: any) => {
  return await request.get({ url: `/edu/course-order/page`, params })
}

// 查询课程订单详情
export const getCourseOrder = async (id: number) => {
  return await request.get({ url: `/edu/course-order/get?id=` + id })
}

// 课程订单退款
export const refundCourseOrder = async (id: number) => {
  return await request.put({ url: `/edu/course-order/refund?id=` + id })
}

// 导出学习记录
export const exportStudyRecord = async (params: any) => {
  return await request.download({ url: `/edu/study-record/export-excel`, params })
}

// 导出课程订单
export const exportCourseOrder = async (params: any) => {
  return await request.download({ url: `/edu/course-order/export-excel`, params })
}
