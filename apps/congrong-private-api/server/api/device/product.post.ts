import { z } from 'zod'

// 定义请求验证模式，所有字段都是可选的
const productQuerySchema = z.object({
  deviceId: z.string().optional(),
  physique: z.string().optional(),
  healthLevel: z.string().optional(),
  tenantId: z.string().optional(),
})

// 定义产品信息接口
interface ProductInfo {
  title: string
  content: string
  checkedImg: string
  uncheckedImg: string
}

/**
 * 查询设备产品信息API
 * 根据设备ID、体质、健康等级和租户ID查询产品信息
 * 使用: POST /api/device/product
 */
export default defineEventHandler(async (event) => {
  try {
    // 读取并验证请求体数据
    const rawBody = await readBody(event)
    const validationResult = productQuerySchema.safeParse(rawBody)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join('; ')
      return createErrorResponse(errorMessages, 400)
    }

    const { deviceId = '', physique = '', healthLevel = '', tenantId = '' } = validationResult.data

    // 使用存储服务
    const storage = useStorage('db')

    // 构建存储键
    const storageKey = `device:product:${tenantId}:${deviceId}:${physique}:${healthLevel}`

    // 从存储中获取产品信息
    const productInfo = await storage.getItem(storageKey) as ProductInfo | null

    if (!productInfo) {
      // 如果没有找到产品信息，返回默认值或错误
      return createErrorResponse('未找到匹配的产品信息', 404)
    }

    // 返回成功响应
    // return createSuccessResponse(productInfo, '获取产品信息成功')
    return {
      code: 200,
      message: '产品信息获取成功',
      data: productInfo,
      timestamp: Date.now(),
    }
  }
  catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : '获取产品信息失败',
      500,
    )
  }
})
