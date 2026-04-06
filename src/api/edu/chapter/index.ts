import request from '@/config/axios'

export interface ChapterVO {
  id?: number
  courseId: number
  name: string
  sort?: number
}

export interface SectionVO {
  id?: number
  chapterId: number
  courseId: number
  name: string
  type?: number
  videoUrl?: string
  duration?: number
  size?: number
  freeFlag?: boolean
  sort?: number
  browseCount?: number
}

// ========================= 课程章节 =========================

// 查询章节列表
export const getChapterList = async (courseId: number) => {
  return await request.get({ url: `/edu/chapter/list?courseId=` + courseId })
}

// 查询章节详情
export const getChapter = async (id: number) => {
  return await request.get({ url: `/edu/chapter/get?id=` + id })
}

// 新增章节
export const createChapter = async (data: ChapterVO) => {
  return await request.post({ url: `/edu/chapter/create`, data })
}

// 修改章节
export const updateChapter = async (data: ChapterVO) => {
  return await request.put({ url: `/edu/chapter/update`, data })
}

// 删除章节
export const deleteChapter = async (id: number) => {
  return await request.delete({ url: `/edu/chapter/delete?id=` + id })
}

// ========================= 课程小节 =========================

// 查询小节列表
export const getSectionList = async (chapterId: number) => {
  return await request.get({ url: `/edu/section/list?chapterId=` + chapterId })
}

// 查询小节详情
export const getSection = async (id: number) => {
  return await request.get({ url: `/edu/section/get?id=` + id })
}

// 新增小节
export const createSection = async (data: SectionVO) => {
  return await request.post({ url: `/edu/section/create`, data })
}

// 修改小节
export const updateSection = async (data: SectionVO) => {
  return await request.put({ url: `/edu/section/update`, data })
}

// 删除小节
export const deleteSection = async (id: number) => {
  return await request.delete({ url: `/edu/section/delete?id=` + id })
}
