import http from '@/utils/http'

const BASE_URL = '/training/training'
const TREE = `${BASE_URL}/getTree`
const STUTREE = `${BASE_URL}/getStuTree`
const TIMERECORD = `${BASE_URL}/updateStudyTimeRecord`
const ENDING = `${BASE_URL}/ending`
const START = `${BASE_URL}/start`

export interface TrainingResp {
  id: string
  title: string
  coverPath: string
  totalDuration: string
  expertId: string
  expertName: string
  fee: string
  description: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  payDeadlineTime: string
}
export interface TrainingDetailResp {
  id: string
  title: string
  coverPath: string
  totalDuration: string
  expertId: string
  expertName: string
  fee: string
  description: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  payDeadlineTime: string // 新增最迟支付时间
}

export interface TrainTreeReq {
  tedTrainingId: number
}

export interface TrainTreeReq {
  tedTrainingId: number
}


export interface TrainingQuery {
  title: string | undefined
  totalDuration: string | undefined
  expertName: string | undefined
  status: number | undefined
  sort: Array<string>
}

export interface TrainingPageQuery extends TrainingQuery, PageQuery {}

// 添加专家列表响应类型
export interface ExpertOption {
  id: string
  name: string
}

/** @desc 获取专家列表 */
export function listExperts() {
  return http.get<ExpertOption[]>(`${BASE_URL}/experts`)
}

/** @desc 查询培训主表列表 */
export function listTraining(query: TrainingPageQuery) {
  return http.get<PageRes<TrainingResp[]>>(`${BASE_URL}`, query)
}

// /** @desc 查询培训主表列表 */
// export function listTraining(query: TrainingPageQuery) {
//   return http.get<PageRes<TrainingResp[]>>(`${BASE_URL}/getAllTraining`, query)
// }

// /** @desc 查询培训主表详情 */
// export function getTraining(id: string) {
//   return http.get<TrainingDetailResp>(`${BASE_URL}/${id}`)
// }

/** @desc 查询培训主表详情 */
export function getTree(data: any) {
  return http.post(`${TREE}`, data)
}

export function getStuTree(data: any) {
  return http.post(`${STUTREE}`, data)
}
/*updateStudyTimeRecord*/
export function updateStudyTimeRecord(data: any) {
  return http.post(`${TIMERECORD}`, data)
}
export function ending(data: any) {
  return http.post(`${ENDING}`, data)
}
export function start(data: any) {
  return http.post(`${START}`, data)
}


/**
 * 查询培训内容
 * @param data
 * @returns
 */
export function trainingContent(data: TrainTreeReq) {
  return http.post(`${BASE_URL}/getTree`, data)}

/** @desc 查询培训主表详情 */
export function getTraining(id: string) {
  return http.get<TrainingDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增培训主表 */
export function addTraining(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改培训主表 */
export function updateTraining(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除培训主表 */
export function deleteTraining(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出培训主表 */
export function exportTraining(query: TrainingQuery) {
  return http.download(`${BASE_URL}/export`, query)
}





