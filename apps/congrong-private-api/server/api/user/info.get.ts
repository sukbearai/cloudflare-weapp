/**
 * 获取用户信息API
 * 返回当前登录用户的基本信息
 * 需要JWT认证，用户信息已通过中间件验证并添加到请求上下文
 */
export default defineEventHandler(async (event) => {
  try {
    // 从请求上下文获取用户信息（由JWT中间件设置）
    const user = event.context.user

    // 检查用户信息是否存在
    if (!user) {
      return createErrorResponse(`用户信息不存在-${event.context.userId}`, 404)
    }

    // 解析 deviceIds 字段（如果存在）
    const userInfo = {
      ...user,
      deviceIds: user.deviceIds ? JSON.parse(user.deviceIds) : [],
    }

    return createSuccessResponse(userInfo, '获取用户信息成功')
  }
  catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : '获取用户信息失败',
      500,
    )
  }
})
