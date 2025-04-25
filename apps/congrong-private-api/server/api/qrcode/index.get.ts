/* eslint-disable ts/no-unused-vars */
export default defineEventHandler(async (event) => {
  const data = await $fetch('/api/test')

  return data
})
