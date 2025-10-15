import http from '@/utils/http'

const BASE_URL = '/training/orgTraining'

export interface OrgTrainingResp {
  id: string
  orgId: string
  trainingId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface OrgTrainingDetailResp {
  id: string
  orgId: string
  trainingId: string
  createUserString: string
  updateUserString: string
}
export interface OrgTrainingQuery {
  sort: Array<string>
}
export interface OrgTrainingPageQuery extends OrgTrainingQuery, PageQuery {}

/** @desc 查询机构培训关联列表 */
export function listOrgTraining(query: OrgTrainingPageQuery) {
  return http.get<PageRes<OrgTrainingResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构培训关联详情 */
export function getOrgTraining(id: string) {
  return http.get<OrgTrainingDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构培训关联 */
export function addOrgTraining(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构培训关联 */
export function updateOrgTraining(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构培训关联 */
export function deleteOrgTraining(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构培训关联 */
export function exportOrgTraining(query: OrgTrainingQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
