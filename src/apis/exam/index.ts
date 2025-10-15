import http from '@/utils/http'


const BASE_URL = '/exam/examPlan'


/**
 * 获取考生信息
 * @returns 
 */
export const getCandidatesInfo = () => {
  return http.get(`${BASE_URL}/candidates/info`)
}

/**
 * 考试结束修改考试计划状态
 * @param data 
 * @param id 
 * @returns 
 */
export function endExam(id: number) {
  return http.post(`${BASE_URL}/end/${id}`)
}