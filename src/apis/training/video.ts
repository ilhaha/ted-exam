import http from '@/utils/http'

const BASE_URL = '/training/video'

export interface VideoResp {
  id: string
  chapterId: string
  title: string
  duration: string
  videoPath: string
  sort: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface VideoDetailResp {
  id: string
  chapterId: string
  title: string
  duration: string
  videoPath: string
  sort: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface VideoQuery {
  chapterId: string | undefined
  title: string | undefined
  duration: string | undefined
  videoPath: string | undefined
  sort: Array<string>
}
export interface VideoPageQuery extends VideoQuery, PageQuery {}

/** @desc 查询视频列表 */
export function listVideo(query: VideoPageQuery) {
  return http.get<PageRes<VideoResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询视频详情 */
export function getVideo(id: string) {
  return http.get<VideoDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增视频 */
export function addVideo(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 自定义新增视频 */
export function customizeaAddVideo(data: any) {
  return http.post(`${BASE_URL}/customize/save`, data)
}

/** @desc 修改视频 */
export function updateVideo(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 自定义修改视频 */
export function customizeaUpdateVideo(data: any, id: string) {
  return http.put(`${BASE_URL}/customize/update/${id}`, data)
}
/** @desc 删除视频 */
export function deleteVideo(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}
/** @desc 自定义删除视频 */
export function customizeaDeleteVideo(id: string,chapterId:string) {
  return http.del(`${BASE_URL}/customize/delete/${id}/${chapterId}`)
}

/** @desc 导出视频 */
export function exportVideo(query: VideoQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
