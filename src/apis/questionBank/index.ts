import http from '@/utils/http'


const BASE_URL = '/examconnect/questionBank'


/**
 * 生成考试计划试卷
 * @param plan 
 * @returns 
 */
export const generateExamQuestionBank = (planId: number) => {
  return http.get(`${BASE_URL}/generate/exam/${planId}`)
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
