import http from '@/utils/http'

const BASE_URL = '/training/projectTraining'

export interface ProjectTrainingResp {
  id: string
  projectId: string
  trainingId: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ProjectTrainingDetailResp {
  id: string
  projectId: string
  trainingId: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ProjectTrainingQuery {
  projectId: string | undefined
  trainingId: string | undefined
  sort: Array<string>
}
export interface ProjectTrainingPageQuery extends ProjectTrainingQuery, PageQuery {}

/** @desc 查询项目培训关联列表 */
export function listProjectTraining(query: ProjectTrainingPageQuery) {
  return http.get<PageRes<ProjectTrainingResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询项目培训关联详情 */
export function getProjectTraining(id: string) {
  return http.get<ProjectTrainingDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增项目培训关联 */
export function addProjectTraining(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改项目培训关联 */
export function updateProjectTraining(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除项目培训关联 */
export function deleteProjectTraining(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出项目培训关联 */
export function exportProjectTraining(query: ProjectTrainingQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
