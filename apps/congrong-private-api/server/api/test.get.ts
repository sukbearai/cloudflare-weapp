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
  const tokenApiResponse = await fetch('https://shebei.congrongtech.cn/api/token')
  const tokenResponse = await tokenApiResponse.json() as TokenResponse
  return tokenResponse
})
