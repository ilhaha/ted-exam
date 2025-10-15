import http from '@/utils/http'

const BASE_URL = '/training/chapter'

export interface ChapterResp {
  id: string
  trainingId: string
  title: string
  parentId: string
  sort: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ChapterDetailResp {
  id: string
  trainingId: string
  title: string
  parentId: string
  sort: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ChapterQuery {
  trainingId: string | undefined
  title: string | undefined
  sort: Array<string>
}
export interface ChapterPageQuery extends ChapterQuery, PageQuery {}

/** @desc 查询章节表列表 */
export function listChapter(query: ChapterPageQuery) {
  return http.get<PageRes<ChapterResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询章节表详情 */
export function getChapter(id: string) {
  return http.get<ChapterDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增章节表 */
export function addChapter(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 自定义新增章节表 */
export function customizeAddChapter(data: any) {
  return http.post(`${BASE_URL}/customize/save`, data)
}

/** @desc 修改章节表 */
export function updateChapter(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 自定义修改章节表 */
export function customizeUpdateChapter(data: any, id: string) {
  return http.put(`${BASE_URL}/customize/update/${id}`, data)
}

/** @desc 删除章节表 */
export function deleteChapter(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 自定义删除章节表 */
export function customizeDeleteChapter(id: string) {
  return http.del(`${BASE_URL}/customize/delete/${id}`)
}
/** @desc 导出章节表 */
export function exportChapter(query: ChapterQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
