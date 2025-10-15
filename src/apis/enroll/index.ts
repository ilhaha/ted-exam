import http from '@/utils/http'


const BASE_URL = '/exam/enroll'


export interface ExamCandidateVO {
    id: string;
    username: string;
    nikename: string;
    examNumber: string;          
    examStatus: string;       
}

export interface EnrollQuery {
    nikename: string;     
}



export interface EnrollPageQuery extends EnrollQuery, PageQuery {}


export interface ExamCandidateVO {
    id: string;
    username: string;
    nikename: string;
    examNumber: string;          
    examStatus: string;       
}

/**
 * 获取考试计划对应考场的所有考生
 * @returns 
 */
export const getExamCandidates = (planId:number,classroomId:string,params:EnrollPageQuery) => {
  return http.get(`${BASE_URL}/candidates/${planId}/${classroomId}`,params)
}
