/**
 * 微信手机号信息响应接口
 */
export interface PhoneNumberResponse {
  /**
   * 带有国家代码的手机号，例如：+86 13800138000
   */
  phoneNumber: string

  /**
   * 不带国家代码的手机号，例如：13800138000
   */
  purePhoneNumber: string

  /**
   * 国家/地区代码，例如：86
   */
  countryCode: string
}
