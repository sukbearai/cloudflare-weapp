export default eventHandler(async () => {
  bot.api.sendMessage('-1002663808019', `消息发送测试 time: ${new Date().toLocaleString()}`)
  return 'ok'
})
