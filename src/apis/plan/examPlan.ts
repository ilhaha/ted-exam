import http from '@/utils/http'

const BASE_URL = '/exam/examPlan'
const DEPT_PROJECTS = `${BASE_URL}/dept/projectList`



export interface EnrollResp {
    id: string;
    examPlanName: string;
    nickName: string;
    startTime: string;          // 考试开始时�?
    enrollEndTime: string;      // 报名截止时间
    enrollStatus: string;       // 报名状�?
    examPlanId: string;
    imageUrl: string;           // 图片路径
}
export interface EnrollStatusResp{
    id: string;
    examPlanName: string;
    nickName: string;
    startTime: string;          // 考试开始时�?
    enrollEndTime: string;      // 报名截止时间
    enrollStatus: string;       // 报名状�?
    examPlanId: string;
    enrollStatus: string;
}
export interface EnrollDetailResp {
    id: string;
    examPlanName: string;
    examPlace: string;          // 考试地点
    examProject: string;        // 考试项目名称（对�?project_name�?
    examFee: string;            // 考试费用（建议改�?number 类型�?
    examDuration: string;       // 考试时长
    startTime: string;          // 考试开始时�?
    enrollEndTime: string;      // 报名截止时间
    imageUrl: string;           // ͼƬ·��
    enrollStatus: string;
    // 证书信息改为数组（一对多关系�?
    certificates: {
        certificateName: string;
        certificateNumber: string;
    }[];

    // 新增文档列表（一对多关系�?
    documentNames: string[];    // 文档类型名称列表
}

export interface ExamPlanQuery {
    sort: Array<string>
}
export interface ExamPlanPageQuery extends ExamPlanQuery, PageQuery {}

interface PageQuery {
  page: number;
  size: number;
}

/** @desc 获取所有考试计划 */
export function getExamPlanList(params: string) {
  return http.get<PageRes<EnrollResp[]>>(`exam/enroll/getEnrollList?${params}`)
}
/** @desc 获取详细信息 */
export function getExamPlanDetail(examPlanId: string) {
  return http.get(`exam/enroll/getAllDetail/byProject/${examPlanId}`)
}

export function getExamPlanStatusList(enrollStatus: string, params: string) {
  if (enrollStatus === 'all') {
    return http.get<PageRes<EnrollResp[]>>(`exam/enroll/getEnrollStatusList?${params}`)
  }
  return http.get<PageRes<EnrollResp[]>>(`exam/enroll/getEnrollStatusList/${enrollStatus}?${params}`)
}

export function viewIdentityCard(examPlanId: string) {
  return http.get(`exam/enroll/viewIdentityCard/${examPlanId}`)
}
