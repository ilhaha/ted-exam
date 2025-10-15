import http from '@/utils/http'
import type {EnrollResp} from "@/apis/plan/examPlan";

const BASE_URL = '/exam/project'

export interface ProjectResp {
    id: string
    projectName: string
    projectCode: string
    examDuration: string
    deptName: string
    redeme: string
    createUser: string
    updateUser: string
    createTime: string
    updateTime: string
    isDeleted: string
    createUserString: string
    updateUserString: string
    disabled: boolean
    projectStatus: string
    imgaeUrl: string
}

export interface ProjectSearchQuery {
    projectName: string
    projectCode: string
    createUser: string
}

export interface StudentProjectDetailResp {
    id: string
    projectName: string
    projectCode: string
    examDuration: string
    deptName: string
    redeme: string
    projectStatus: string
    imgaeUrl: string
    documentList: string[];
    locationList: string[];
}

export interface ProjectQuery {
    sort: Array<string>
}
export interface ProjectPageQuery extends ProjectQuery, PageQuery {}

/** @desc 查询项目列表 */
export function getProjectList(params: string) {
  return http.get<PageRes<ProjectResp[]>>(`exam/project/getAllProject?${params}`)
}
export function getProjectStatusList(status: string, params: string) {
    return http.get<PageRes<EnrollResp[]>>(`exam/project/getProjectByStatus/${status}?${params}`)
}

// 获取项目所需资料
export function getProjectDocuments(projectId: string) {
  return http.get(`/project/${projectId}/documents`)
}

export function getProjectDetail(projectId: string) {
    return http.get(`exam/project/studentDetail/${projectId}`)
}
