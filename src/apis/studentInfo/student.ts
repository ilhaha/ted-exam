import http from '@/utils/http'
export interface StudentInfo {
    avatar: string
    nickName: string
    documentList: string[]
    position?: string
    phoneNumber?: string
    email?: string
    deptName?: string
}

export function getStudentInfo() {
    return http.get<StudentInfo>(`/exam/enroll/getEnrollInfo`)
}

export function getStudentScore(username, identity) {
    return http.post('/exam/enroll/getScore', { username, identity })
}
