export default defineEventHandler(async () => {
  const text = await $fetch('/api/test')
  return text
})
