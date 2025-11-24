import http from '@/utils/http'


const BASE_URL = '/examconnect/questionBank'


/**
 * 重新生成考生试卷
 * @param plan 
 * @returns 
 */
export const restGenerateExamQuestionBank = (data: any) => {
  return http.post(`${BASE_URL}/rest/paper`, data)
}

/**
 * 获取考试计划的题目
 * @param plan 
 * @returns 
 */
// export const getExamQuestionBank = (planId:number) => {
//   return http.get(`${BASE_URL}/exam/${planId}`)
// }


/**
 * 获取考试计划的题目
 * @param plan 
 * @returns 
 */
export const getExamQuestionBank = (planId: number, userId: number) => {
  return http.get(`${BASE_URL}/candidate/paper/${planId}/${userId}`)
}
