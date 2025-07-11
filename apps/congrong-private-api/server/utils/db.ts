export { and, eq, or, sql } from 'drizzle-orm'
export type { DrizzleD1Database } from 'drizzle-orm/d1'
export { drizzle } from 'drizzle-orm/d1'
export { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
// 不要删下面这行代码，会导致生产报错 schema is not defined
export * as schema from '~~/db/schema'
export { usersTable } from '~~/db/schema/user'
export { productsTable } from '~~/db/schema/product'
export type { TokenData, WechatApiError, WechatTokenResponse } from '~~/types/'
