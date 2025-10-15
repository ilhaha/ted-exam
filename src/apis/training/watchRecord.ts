import http from '@/utils/http'

const BASE_URL = '/training/watchRecord'

export interface WatchRecordResp {
  id: string
  studentId: string
  videoId: string
  watchedDuration: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WatchRecordDetailResp {
  id: string
  studentId: string
  videoId: string
  watchedDuration: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface WatchRecordQuery {
  studentId: string | undefined
  videoId: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface WatchRecordPageQuery extends WatchRecordQuery, PageQuery {}

/** @desc 查询学习记录列表 */
export function listWatchRecord(query: WatchRecordPageQuery) {
  return http.get<PageRes<WatchRecordResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询学习记录详情 */
export function getWatchRecord(id: string) {
  return http.get<WatchRecordDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增学习记录 */
export function addWatchRecord(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改学习记录 */
export function updateWatchRecord(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除学习记录 */
export function deleteWatchRecord(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出学习记录 */
export function exportWatchRecord(query: WatchRecordQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
