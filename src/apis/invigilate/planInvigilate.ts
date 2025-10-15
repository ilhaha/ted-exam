import http from '@/utils/http'

export interface EnrollResp {
  id: string
  redeme: string
  startTime: string
  endTime: string
  planPicUrl: string
}

export interface InvigilateExamDetailResp {
  examPlanName: string
  imageUrl: string // 对应后端的 imageUrl
  startTime: string // LocalDateTime 会转为字符串
  endTime: string // LocalDateTime 会转为字符串
  redeme: string // 注意拼写是否应为 "redeem"？
  locationName: string
  invigilateStatus: number
  examDuration: number // Long 转为 number
}

export interface Grades {
  planId: string
  candidateId: string
  examScores: string
  answerSheetUrl: string
  reviewStatus: number
}

// 在类型定义文件中（如@/types/invigilate.d.ts）

// 对应 @RequestBody TedExamRecords
export interface TedExamRecords {
  /**
   * 考试ID
   */
  planId: number
  /**
   * 考生ID
   */
  candidateId: number
  /**
   * 考试成绩
   */
  examScores?: number
  /**
   * 答卷文件URL
   */
  answerSheetUrl?: string
  /**
   * 审核状态（0-待审核 1-已通过 2-已拒绝）
   */
  reviewStatus?: number
}

// 成绩表格行类型
export interface ScoreTableItem extends TedExamRecords {
  isExisting: boolean // 是否已存在记录
  studentName?: string // 前端展示用考生姓名
}

/**
 * 查询待审核和被拒绝的考试记录
 */
export function queryAlreadyCommitOrReject(examId: any) {
  return http.get<Grades>(`/exam/review/scores/alreadyCommitOrReject?examId=${examId}`)
}

/** @desc 根据监考人员ID分页查询考试计划监考关联列表 */
export function listPlanInvigilateByInvigilator(params: string) {
  return http.get<PageRes<EnrollResp[]>>(`/invigilate/byPlanInvigilatorId?${params}`)
}

/**
 * 根据考试id查询考试信息和监考人员id
 * @param params
 */
export function getInvigilateDetail(params: string) {
  return http.get<InvigilateExamDetailResp>(`/invigilate/getInvigilateDetail?${params}`)
}

export const submitExamScores = (data: FormData) => {
  return http.post('/invigilate/scores/submit', data)
}

export const getNeedReviewRecords = (examId: number) => {
  return http.get<Grades>(`/exam/review/records?examId=${examId}`)
}

// 提交审核结果
export const submitReviewResult = (examId: number, candidateIds: any[]) => {
  return http.put<boolean>('/exam/review/status', candidateIds, {
    params: {
      examId,
    },
  })
}

// 删除记录
export const deleteScoreRecord = (planId: number, candidateId: number) => {
  return http.post(`/exam/review/deleteScoresRecord?planId=${planId}&candidateId=${candidateId}`)
}

// 更新记录
export const updateScoreRecord = (data: TedExamRecords) => {
  return http.post('/exam/review/updateScoresRecord', data)
}

// 获取开考密码
export const getExamPassword = (examId: number) => {
  return http.get<string>(`/invigilate/getPassword?examId=${examId}`)
}
