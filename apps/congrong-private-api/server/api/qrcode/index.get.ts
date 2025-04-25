export default defineEventHandler(async () => {
  const token = await $fetch('/api/token')
  return { token }
})
