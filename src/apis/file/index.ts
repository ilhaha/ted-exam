import http from '@/utils/http'

const BASE_URL = '/upload'



/** @desc 上传文件 */
export function upload(data: FormData) {
    return http.post(`${BASE_URL}/file`, data)
}