import { z } from 'zod'

// 定义请求验证模式，所有字段都是可选的
const productUpdateSchema = z.object({
  deviceId: z.string().optional(),
  physique: z.string().optional(),
  healthLevel: z.string().optional(),
  tenantId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  checkedImg: z.string().optional(),
  uncheckedImg: z.string().optional(),
})

/**
 * 更新设备产品信息API
 * 根据设备ID、体质、健康等级和租户ID更新产品信息
 * 使用: POST /api/device/product-update
 */
export default defineEventHandler(async (event) => {
  try {
    // 读取并验证请求体数据
    const rawBody = await readBody(event)
    const validationResult = productUpdateSchema.safeParse(rawBody)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join('; ')
      return createErrorResponse(errorMessages, 400)
    }

    const {
      deviceId = '',
      physique = '',
      healthLevel = '',
      tenantId = '',
      title = '',
      content = '',
      checkedImg = '',
      uncheckedImg = '',
    } = validationResult.data

    // 使用存储服务
    const storage = useStorage('db')

    // 构建存储键
    const storageKey = `device:product:${tenantId}:${deviceId}:${physique}:${healthLevel}`

    // 构建产品信息对象
    const productInfo = {
      title,
      content,
      checkedImg,
      uncheckedImg,
    }

    // 保存到存储中
    await storage.setItem(storageKey, productInfo)

    // 返回成功响应
    return createSuccessResponse(productInfo, '产品信息更新成功')
  }
  catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : '更新产品信息失败',
      500,
    )
  }
})
