/**
 * 求职状态工具函数
 */
export const JOB_STATUS_MAP: Record<number, string> = {
  0: '在职，随时到岗',
  1: '在职，考虑机会',
  2: '离职，随时到岗',
  3: '暂不考虑'
}

export const JOB_STATUS_TAG_TYPE_MAP: Record<number, string> = {
  0: 'success',
  1: 'warning',
  2: 'danger',
  3: 'info'
}

export const getJobStatusLabel = (status?: number): string => {
  return status !== undefined ? JOB_STATUS_MAP[status] ?? '未知' : '-'
}

export const getJobStatusTagType = (status?: number): string => {
  return status !== undefined ? JOB_STATUS_TAG_TYPE_MAP[status] ?? 'info' : 'info'
}

/**
 * 投递状态工具函数
 */
export const APPLICATION_STATUS_MAP: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '已邀约'
}

export const APPLICATION_STATUS_TAG_TYPE_MAP: Record<number, string> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
  3: 'primary'
}

export const getApplicationStatusLabel = (status: number): string => {
  return APPLICATION_STATUS_MAP[status] ?? '未知'
}

export const getApplicationStatusTagType = (status: number): string => {
  return APPLICATION_STATUS_TAG_TYPE_MAP[status] ?? 'info'
}

/**
 * 薪资格式化
 */
export const formatSalaryRange = (min?: number, max?: number): string => {
  if (!min && !max) return '面议'
  if (min && max) return `${min}K - ${max}K`
  if (min) return `${min}K 以上`
  return `${max}K 以下`
}
