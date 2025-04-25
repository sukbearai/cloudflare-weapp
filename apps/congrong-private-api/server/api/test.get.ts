export default eventHandler(async () => {
  const tokenApiResponse = await fetch('https://shebei.congrongtech.cn/api/token', {
    mode: 'no-cors', // 添加 no-cors 模式以绕过 CORS 限制
  })
  const tokenResponseRes = await tokenApiResponse
  return tokenResponseRes
})
