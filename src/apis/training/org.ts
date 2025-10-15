import http from '@/utils/http'

const BASE_URL = '/training/org'

export interface OrgResp {
  id: string
  code: string
  name: string
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  CandidateName: string[]
}
export interface OrgDetailResp {
  id: string
  code: string
  name: string
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  nickname: string
  phone: string
}
export interface OrgQuery {
  code: string | undefined
  sort: Array<string>
}
export interface OrgPageQuery extends OrgQuery, PageQuery {}

/** @desc 查询机构信息列表 */
export function listOrg(query: OrgPageQuery) {
  return http.get<PageRes<OrgResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构信息详情 */
export function getOrg(id: string) {
  return http.get<OrgDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构信息 */
export function addOrg(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构信息 */
export function updateOrg(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构信息 */
export function deleteOrg(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构信息 */
export function exportOrg(query: OrgQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/**@desc 导入机构考生关联信息 */
export function getStudents(id:string) {
  return http.get(`${BASE_URL}/${id}`)
}

export function getOrgInfo() {
  return http.get<OrgDetailResp>(`${BASE_URL}/getOrgInfo`)
}

