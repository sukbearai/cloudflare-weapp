declare module 'h3' {
  interface H3EventContext {
    bucket: any
  }
}

export default defineEventHandler(async ({ context }) => {
  const cloudflare = context.cloudflare
  const { BUCKET } = cloudflare.env
  context.bucket = BUCKET
})
