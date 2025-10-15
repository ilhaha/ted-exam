import http from '@/utils/http'

const BASE_URL = '/training/expert'

export interface ExpertResp {
  id: string
  name: string
  idCard: string
  education: string
  title: string
  avatar: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExpertDetailResp {
  id: string
  name: string
  idCard: string
  education: string
  title: string
  avatar: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExpertQuery {
  name: string | undefined
  sort: Array<string>
}
export interface ExpertPageQuery extends ExpertQuery, PageQuery {}

/** @desc 查询专家信息列表 */
export function listExpert(query: ExpertPageQuery) {
  return http.get<PageRes<ExpertResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询专家信息详情 */
export function getExpert(id: string) {
  return http.get<ExpertDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增专家信息 */
export function addExpert(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改专家信息 */
export function updateExpert(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除专家信息 */
export function deleteExpert(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出专家信息 */
export function exportExpert(query: ExpertQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
