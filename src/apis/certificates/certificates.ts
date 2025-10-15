import http from '@/utils/http'

const BASE_URL = '/certificate/candidateCertificate'
export interface CandidateCertificateResp {
    id: string
    candidateId: string
    candidateTypeName: string
    certificateId: string
    projectName: string
    certificateStatus: string
    certificateNumber: string
    certificateTypeName: string
    issuerId: string
    issuerName: string
    holdingDate: string
    expiryDate: string
    imageUrl: string

}
export interface CandidateCertificateQuery {
    certificateId: string | undefined
    certificateStatus: string | undefined
    certificateNumber: string | undefined
    issuerId: string | undefined
    sort: Array<string>
}
export interface CandidateCertificatePageQuery extends CandidateCertificateQuery, PageQuery {}
interface PageQuery {
    page: number;
    size: number;
}

/**@desc 获取所有证书*/
export function getCandidateCertificateList(params: string) {
    return http.get<PageRes<CandidateCertificateResp>>(`${BASE_URL}/getCandidateCertificateList?${params}`)
}
/**@desc 获取用户证书*/
export function getUserCertificate() {
    return http.get(`${BASE_URL}/getUserCertificate`)
}


  export interface CertificateListResponse {
    list: any;
    code: number;
    msg: string;
    data: {
      list: CandidateCertificateResp[];
      total: number;
    }
  }
  
  // 根据考生学号查询证书列表
  export const getCertificateByCandidateId = (candidateId: string) => {
    return http.get<CertificateListResponse[]>(`${BASE_URL}/getUserCertificateList/${candidateId}`);
  }
  

//   export interface reexamine
// {
//   certificateId: string;      // 证件ID
//   applicationFormUrl: string; // 复审资格申请表URL
//   qualificationCertUrl: string; // 作业资格证URL
// }
// 提交证件复审申请
export const submitReexamination = (data: {
  certificateId: string;
  applicationFormUrl: string;
  qualificationCertUrl: string;
}) => {
  return http.post(`${BASE_URL}/reexamine`, data);
}
  