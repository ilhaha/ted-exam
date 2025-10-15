import http from '@/utils/http'

const BASE_URL = '/document/document'

export interface DocumentResp {
  id: string
  docPath: string
  typeId: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  typeName: string
 
}
export interface DocumentQuery {
  docPath: string | undefined
  typeId: string | undefined
  createUser: string | undefined
  sort: Array<string>
}

export interface DocumentPageQuery extends DocumentQuery, PageQuery {}

/** @desc 上传文件 */
export function upload(data: FormData) {
  return http.post(`/upload/file`, data)
}

/** @desc 获取资料种类名称 */
export function getDocumentTypes() {
  return http.get(`/document/document/getType`)
}
/** @desc 上传资料 */
export function uploadDocument(data: FormData) {
  return http.post(`/document/document/upload`, data)
}
/** @desc 获取资料接口 */
export function listDocument(params: string) {
  return http.get<PageRes<DocumentResp[]>>(`/document/examineeDocument/listDocument?${params}`)
}
