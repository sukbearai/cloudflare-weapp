export default defineTask({
  meta: {
    name: 'test:alarm',
    description: 'Alarm task',
  },
  run() {
    bot.api.sendMessage('-1002663808019', `定时消息测试 time: ${new Date().toLocaleString()}`)
    return { result: 'ok' }
  },
})
