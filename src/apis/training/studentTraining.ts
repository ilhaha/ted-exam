import http from '@/utils/http'

const BASE_URL = '/training/studentTraining'

export interface StudentTrainingResp {
  id: string
  studentId: string
  trainingId: string
  totalDuration: string
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
export interface StudentTrainingDetailResp {
  id: string
  studentId: string
  trainingId: string
  totalDuration: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface StudentTrainingQuery {
  studentId: string | undefined
  trainingId: string | undefined
  sort: Array<string>
}
export interface StudentTrainingPageQuery extends StudentTrainingQuery, PageQuery {}

/** @desc 查询学生培训列表 */
export function listStudentTraining(query: StudentTrainingPageQuery) {
  return http.get<PageRes<StudentTrainingResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询学生培训详情 */
export function getStudentTraining(id: string) {
  return http.get<StudentTrainingDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增学生培训 */
export function addStudentTraining(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改学生培训 */
export function updateStudentTraining(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除学生培训 */
export function deleteStudentTraining(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出学生培训 */
export function exportStudentTraining(query: StudentTrainingQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
