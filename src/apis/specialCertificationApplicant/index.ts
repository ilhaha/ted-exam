import http from '@/utils/http'
import type {UnwrapRef} from "vue";
const BASE_URL = '/exam/specialCertificationApplicant'
export interface SpecialCertificationApplicant {
    id?: number; 
    planId: number;
    candidatesId: number;
    imageUrl: String;
  }

  /**
   * 根据考生id获取特种设备人员资格申请表信息
   * @returns 
   */
  export function getCandidatesId(planId: number) {
      return http.get<SpecialCertificationApplicant>(`${BASE_URL}/candidates/${planId}`)
  }

/**
 */
export function candidatesUpload(data: SpecialCertificationApplicant) {
  return http.post(`${BASE_URL}/candidates/upload`, data)
}

/**
 * 机构代替一个及多个考生上传特种设备人员资格申请表
 */
export function candidatesUploads(data: any) {
  return http.post(`${BASE_URL}/candidates/uploads`, data)
}
