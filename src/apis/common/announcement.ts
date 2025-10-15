import http from '@/utils/http'
import pako from "pako";

const BASE_URL = '/common/announcement'
const INDEX = `${BASE_URL}/index`
const HOME = `${BASE_URL}/home`
const SELECT = `${BASE_URL}/select`


export interface AnnouncementResp {
  id: string
  title: string
  content: string
  status: string
  createUser: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface AnnouncementDetailResp {
  id: string
  title: string
  content: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface AnnouncementQuery {
  title: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface AnnouncementPageQuery extends AnnouncementQuery, PageQuery {}


/** @desc 查询首页公告列表 */
export function listAnnouncementIndex() {
  return http.get(`${INDEX}`)
}

/** @desc 查询登录后公告列表 */
export function listAnnouncementHome() {
  return http.get(`${HOME}`)
}

/** @desc 查询公告管理列表 */
export function listAnnouncement(query: AnnouncementPageQuery) {
  return http.get<PageRes<AnnouncementResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询公告管理详情 */
export function getAnnouncement(id: string) {
  return http.get(`${BASE_URL}/detail/${id}`)
}

export function selectAnnouncement() {
  return http.get(`${SELECT}`)
}



export const decompressBase64 = (base64: string): string => {
  try {
    // 1. Base64 解码
    const decodedData = Uint8Array.from(
        atob(base64)
            .split('')
            .map(char => char.charCodeAt(0))
    );

    // 2. 解压缩 GZIP 数据
    const decompressed = pako.ungzip(decodedData, { to: 'string' });

    return decompressed;
  } catch (error) {
    console.error('解压失败:', error);
    return '内容解析失败'; // 显示友好错误信息
  }
};
