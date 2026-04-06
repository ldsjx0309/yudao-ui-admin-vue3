import request from '@/config/axios'

export interface CourseVO {
  id?: number
  name: string
  categoryId: number
  coverUrl?: string
  introduction?: string
  teacherName?: string
  price?: number
  originalPrice?: number
  validDays?: number
  sort?: number
  status: number
  browseCount?: number
  studyCount?: number
  freeCount?: number
}

export interface CourseCategoryVO {
  id?: number
  name: string
  picUrl?: string
  sort?: number
  status?: number
  parentId?: number
}

// ========================= 课程分类 =========================

// 查询课程分类列表
export const getCourseCategoryList = async (params?: any) => {
  return await request.get({ url: `/edu/course-category/list`, params })
}

// 查询课程分类详情
export const getCourseCategory = async (id: number) => {
  return await request.get({ url: `/edu/course-category/get?id=` + id })
}

// 新增课程分类
export const createCourseCategory = async (data: CourseCategoryVO) => {
  return await request.post({ url: `/edu/course-category/create`, data })
}

// 修改课程分类
export const updateCourseCategory = async (data: CourseCategoryVO) => {
  return await request.put({ url: `/edu/course-category/update`, data })
}

// 删除课程分类
export const deleteCourseCategory = async (id: number) => {
  return await request.delete({ url: `/edu/course-category/delete?id=` + id })
}

// ========================= 课程 =========================

// 查询课程分页列表
export const getCoursePage = async (params: any) => {
  return await request.get({ url: `/edu/course/page`, params })
}

// 查询课程详情
export const getCourse = async (id: number) => {
  return await request.get({ url: `/edu/course/get?id=` + id })
}

// 新增课程
export const createCourse = async (data: CourseVO) => {
  return await request.post({ url: `/edu/course/create`, data })
}

// 修改课程
export const updateCourse = async (data: CourseVO) => {
  return await request.put({ url: `/edu/course/update`, data })
}

// 删除课程
export const deleteCourse = async (id: number) => {
  return await request.delete({ url: `/edu/course/delete?id=` + id })
}

// 修改课程状态
export const updateCourseStatus = async (id: number, status: number) => {
  return await request.put({ url: `/edu/course/update-status`, data: { id, status } })
}

// 获取课程简单列表（用于下拉）
export const getSimpleCourseList = async () => {
  return await request.get({ url: `/edu/course/list-all-simple` })
}
