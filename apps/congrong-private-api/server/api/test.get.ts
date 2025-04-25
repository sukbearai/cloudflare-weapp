interface TokenResponse {
  data: {
    access_token: string
    expires_in: number
    from_cache?: boolean
  }
  message: string
  code: number
}

export default eventHandler(async () => {
  const tokenApiResponse = await fetch('https://shebei.congrongtech.cn/api/token', {
    mode: 'no-cors', // 添加 no-cors 模式以绕过 CORS 限制
  })
  const tokenResponse = await tokenApiResponse.json() as TokenResponse
  return tokenResponse
})
