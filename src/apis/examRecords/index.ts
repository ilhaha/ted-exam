import http from '@/utils/http'


const BASE_URL = '/exam/examRecords'

/**
 * 提交试卷
 * @returns 
 */
export const addRecord = (data:any) => {
  return http.post(`${BASE_URL}/candidates/add`,data)
}