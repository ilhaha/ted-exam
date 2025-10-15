import http from '@/utils/http'

const BASE_URL = '/training/org'

export interface OrgResp {
  id: string
  examPlanName: string
  nickName: string
  startTime: string// 考试开始时间
  enrollEndTime: string// 报名截止时间
  enrollStatus: string// 报名状态
  examPlanId: string
  imageUrl: string// 图片路径
}

export interface EnrollStatusResp {
  id: string
  examPlanName: string
  nickName: string
  startTime: string// 考试开始时间
  enrollEndTime: string// 报名截止时间
  enrollStatus: string// 报名状态
  examPlanId: string
}

export function uploadExcel(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return http.post(`/training/org/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function parseExcel(fileId: string) {
  return http.post(`/training/org/parse`, null, {
    params: { fileId },
  })
}

export function getCandidatesList() {
  return http.get<OrgResp[]>(`/training/org/getCandidates`)
}

export function getAgencyStatusList(currentStatus: string, params: string) {
  return http.get(`${BASE_URL}/getAllOrgInfo/${currentStatus}?${params}`)
}

// 获取机构详情
export function getAgencyDetail(orgId: string) {
  return http.get(`${BASE_URL}/orgDetail/${orgId}`)
}

export function getAgencyStatus(orgId: any) {
  return http.get(`${BASE_URL}/getAgencyStatus/${orgId}`)
}

export function studentAddAgency(orgId: any) {
  return http.get(`${BASE_URL}/studentAddAgency/${orgId}`)
}

export function studentDelAgency(orgId: any) {
  return http.get(`${BASE_URL}/studentDelAgency/${orgId}`)
}

export function getStudentAddList() {
  return http.get<OrgResp[]>(`${BASE_URL}/getCandidates`, { type: 'add' })
}

export function approveStudent(orgId: string, userId: string) {
  return http.get(`${BASE_URL}/approveStudent`, { orgId, userId })
}

export function refuseStudent(orgId: string, userId: string) {
  return http.get(`${BASE_URL}/refuseStudent`, { orgId, userId })
}

export function getOneCandidateDocument(orgId: string) {
  return http.get(`/file/personFile/getOneCandidateDocument/${orgId}`)
}
