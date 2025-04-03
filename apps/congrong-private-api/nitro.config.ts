/* eslint-disable node/prefer-global/process */
// https://nitro.unjs.io/config
import nitroCloudflareBindings from 'nitro-cloudflare-dev'

export default defineNitroConfig({
  modules: [nitroCloudflareBindings],
  srcDir: 'server',

  // routeRules: {
  //   '/api/**': { cors: true, headers: { 'access-control-allow-methods': 'POST, GET, OPTIONS' } },
  // },

  storage: {
    db: {
      driver: 'cloudflareKVBinding',
      binding: 'congrong-private-api',
    },
  },

  devStorage: {
    db: {
      driver: 'fs',
      base: './.data/db',
    },
  },

  runtimeConfig: {
    appId: process.env.appId,
    appSecret: process.env.appSecret,
    jwtSecret: process.env.jwtSecret,
  },

  preset: 'cloudflare_module',

  compatibilityDate: '2025-04-02',
})
