import type { PhoneNumberResponse } from './types'
import { alovaInstance as request } from '../request'

/**
 * 获取用户手机号
 * @param code 微信授权获取到的code
 * @param openid 可选，用户openid
 * @returns 手机号信息
 */
export function getPhoneNumber(code: string, openid?: string) {
  return request.Post<PhoneNumberResponse>('/api/phone', {
    code,
    openid,
  })
}

/**
 * 微信服务相关API
 */
export function useWxService() {
  return {
    getPhoneNumber,
  }
}
