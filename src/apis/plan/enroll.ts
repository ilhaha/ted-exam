import http from '@/utils/http'

const BASE_URL = '/exam/enroll'



export interface EnrollReq {
    enrollStatus: number;
    examPlanId: number;
}


/** @desc 考生考试报名*/
export function singUp(data: EnrollReq) {
    return http.post(`${BASE_URL}/singUp`,data)
}

/** @desc 校验考试时间*/
export function checkEnrolledTime(examPlanId: number) {
    return http.get(`${BASE_URL}/checkEnrollTime?examPlanId=${examPlanId}`)
}
/** @desc 考生取消报名*/
export function cancelEnroll(examPlanId: number) {
    return http.get(`${BASE_URL}/cancelEnroll/${examPlanId}`)
}