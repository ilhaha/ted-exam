import http from '@/utils/http'

const BASE_URL = '/common/carousel'
const INDEX = `${BASE_URL}/index`

export interface CarouselResp {
  id: string
  imageUrl: string
  linkUrl: string
  description: string
  sortOrder: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CarouselDetailResp {
  id: string
  imageUrl: string
  linkUrl: string
  description: string
  sortOrder: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CarouselQuery {
  status: string | undefined
  sort: Array<string>
}
export interface CarouselPageQuery extends CarouselQuery, PageQuery {}

/** @desc 首页轮播图 */
export function carouselIndex() {
  return http.get(`${INDEX}`)
}

/** @desc 查询轮播图管理列表 */
export function listCarousel(query: CarouselPageQuery) {
  return http.get<PageRes<CarouselResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询轮播图管理详情 */
export function getCarousel(id: string) {
  return http.get<CarouselDetailResp>(`${BASE_URL}/${id}`)
}
