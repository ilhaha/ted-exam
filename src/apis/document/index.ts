import http from '@/utils/http'

const BASE_URL = '/document/document'



export interface DocumentTypeNameVO {
    value: number;
    label: String;
    disabled: boolean;
}

/**
 * 获取资料类型列表
 * @returns 
 */
export function getTypeNameList() {
    return http.get<DocumentTypeNameVO[]>(`${BASE_URL}/typeName`)
}


/**
 * 考生上传资料
 * @returns 
 */
export function studentUploadDocuments(data) {
    return http.post(`/document/examineeDocument/studentUploadDocuments`,data)
}
