import http from '@/utils/http'
import { List } from 'echarts'

export interface ExpertFreeResp {
  id: string
  expertId: string
  expertName: string
  expertTitle: string
  expertArea: string
  projectName: string
  examStartDate: string
  examStopDate: string
  free: number
  payCompletionTime: string  // LocalDateTime will be represented as string in TypeScript
  status: string
  imageUrl: string
}

// 在 organization.ts 中添加
export interface ExpertFreeShouldResp {
  expertId: number
  expertName: string
  projectName: string
  free: number
  payDeadlineTime: string
  payCompletionTime: string | null
  status: number
}

// 添加导出选中专家的请求参数接口
export interface ExportSelectedExpertsReq {
  expertIds: string[]
  status?: number
}


// 查询专家列表(需要有项目)
export interface ExpertFreelistResp {
  idCard: string
  education: string
  projectName: string
  projectId:string
  examStopDate: string
  free: number
  status: string
  payCompletionTime: string  // LocalDateTime will be represented as string in TypeScript
}

// 查询专家列表(不需要有项目)
export interface ExpertFreeList {
  idCard: string
  education: string


}

export interface ExpertAddReq {
  name: string
  idCard: string
  education: string
  title: string
  avatar: string
}


// 修改后的请求函数（路径参数方式）
export function queryExpertFree(current: number, size: number) {
  return http.get<ExpertFreeResp>(`/expertFree?current=${current}&size=${size}`)
}

// 添加新的查询接口
export function queryExpertShouldPay(begin: string, end: string) {
  return http.get<ExpertFreeShouldResp[]>(`/expertFree/Between?begin=${begin}&end=${end}`)
}

// 查询专家详情（(需要有项目)）
export function  queryExpertDetail(id: string) {
  return http.get<ExpertFreelistResp>(`/expertFree/${id}`)
}

// 添加专家+机构关联
export const addExpert = (data: ExpertAddReq) => {
  return http.post('/expertFree/addexpert', data)
}

// 修改专家
export const updateExpert = (id: string, data: ExpertAddReq) => {
  
  return http.put(`/expertFree/update/${id}`, data)
}

// 查询专家列表(不需要有项目)
export const queryExpertDetailLISt = (id: string) => {
  return http.get<ExpertFreeList>(`/expertFree/list/${id}`)
}

//更新费用和状态
export const updateExpertFree = (id: string, data: ExpertFreelistResp) => {
  
  return http.put(`/expertFree/updateFree/${id}`, data)
}

// 添加导出选中专家的API函数
export function exportSelectedExperts(data: ExportSelectedExpertsReq) {
  return http.post<ExpertFreeShouldResp[]>('/expertFree/export/selected', data)
}
