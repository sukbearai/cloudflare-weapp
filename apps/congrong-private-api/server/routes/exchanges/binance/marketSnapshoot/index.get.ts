/* eslint-disable ts/no-use-before-define */
import type { BinanceOpenInterest } from '../openInterest/types'
import type { BinancePremiumIndex } from '../premiumIndex/types'
import type { BinanceTopLongShortAccountRatio } from '../topLongShortAccountRatio/types'
import type { BinanceMarketSnapshoot } from './types'
import { z } from 'zod'

// 定义历史数据存储
interface HistoricalData {
  openInterest: string
  timestamp: number
}

// 使用 Map 存储每个交易对的历史数据
const historicalDataMap = new Map<string, HistoricalData[]>()

// 扩展 marketSnapshoot 类型，添加因子和信号
interface ExtendedBinanceMarketSnapshoot extends BinanceMarketSnapshoot {
  oiChangePctPositive: number // 未平仓合约变化率（正向）
  basisPercentNegative: number // 负基差百分比
  signal: 'long' | 'short' | 'hold' // 交易信号
}

/**
 * 获取币安市场快照数据，并生成交易信号
 * 使用: GET /exchanges/binance/marketSnapshoot
 * 参数:
 *   symbol - 交易对名称，如 BTCUSDT
 *   period - 大户多空比例的时间周期，如 "5m","15m","30m","1h","2h","4h","6h","12h","1d"，默认为 "4h"
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取并验证参数
    const query = getQuery(event)
    const schema = z.object({
      symbol: z.string({ required_error: '缺少必要参数 symbol' }),
      period: z.enum(['5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'], {
        invalid_type_error: 'period 必须是有效的时间周期',
      }).default('4h'),
    })

    const validationResult = schema.safeParse(query)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join('; ')
      return createErrorResponse(errorMessages, 400)
    }

    const { symbol, period } = validationResult.data
    const config = useRuntimeConfig()
    const binanceApiUrl = config.binance?.url

    // 并行请求多个API获取数据
    const [premiumIndexData, topLsRatioData, openInterestData] = await Promise.all([
      fetchBinanceData<BinancePremiumIndex>(`${binanceApiUrl}/fapi/v1/premiumIndex?symbol=${symbol}`, '获取标记价格'),
      fetchBinanceData<BinanceTopLongShortAccountRatio[]>(`${binanceApiUrl}/futures/data/topLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=1`, '获取大户多空比例')
        .then(data => data[0]),
      fetchBinanceData<BinanceOpenInterest>(`${binanceApiUrl}/fapi/v1/openInterest?symbol=${symbol}`, '获取未平仓合约数量'),
    ])

    // 计算关键因子
    const currentTimestamp = Date.now()
    const currentOpenInterest = Number.parseFloat(openInterestData.openInterest)

    // 处理历史数据
    if (!historicalDataMap.has(symbol)) {
      historicalDataMap.set(symbol, [])
    }
    const historicalData = historicalDataMap.get(symbol)!

    // 计算未平仓合约变化率
    const oiChangePctPositive = calculateOiChangePct(historicalData, currentOpenInterest)

    // 更新历史数据（只保留最近两个数据点）
    updateHistoricalData(historicalData, openInterestData.openInterest, currentTimestamp)

    // 计算负基差百分比
    const indexPrice = Number.parseFloat(premiumIndexData.indexPrice)
    const markPrice = Number.parseFloat(premiumIndexData.markPrice)
    const basisPercent = (markPrice - indexPrice) / indexPrice
    const basisPercentNegative = basisPercent < 0 ? Math.abs(basisPercent) : 0

    // 获取大户多空账户比例
    const topTraderAccountLsRatio = Number.parseFloat(topLsRatioData.longShortRatio)

    // 生成交易信号
    const signal = generateSignal(oiChangePctPositive, basisPercentNegative, topTraderAccountLsRatio)

    // 整合数据
    const marketSnapshoot: ExtendedBinanceMarketSnapshoot = {
      symbol,
      indexPrice: premiumIndexData.indexPrice,
      markPrice: premiumIndexData.markPrice,
      topTraderAccountLsRatio: topLsRatioData.longShortRatio,
      openInterest: openInterestData.openInterest,
      timestamp: currentTimestamp,
      oiChangePctPositive,
      basisPercentNegative,
      signal,
    }

    return createSuccessResponse(marketSnapshoot, '获取市场快照数据成功')
  }
  catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : '获取市场快照数据失败',
      500,
    )
  }
})

// 辅助函数：获取币安API数据
async function fetchBinanceData<T>(url: string, errorPrefix: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`${errorPrefix}失败: ${response.status}`)
  }

  return response.json() as Promise<T>
}

// 辅助函数：计算未平仓合约变化率
function calculateOiChangePct(historicalData: HistoricalData[], currentOI: number): number {
  if (historicalData.length === 0) { return 0 }

  const previousData = historicalData[historicalData.length - 1]
  const previousOI = Number.parseFloat(previousData.openInterest)
  const oiChangePct = (currentOI - previousOI) / previousOI

  return oiChangePct > 0 ? oiChangePct : 0
}

// 辅助函数：更新历史数据
function updateHistoricalData(historicalData: HistoricalData[], openInterest: string, timestamp: number): void {
  historicalData.push({ openInterest, timestamp })
  if (historicalData.length > 2) {
    historicalData.shift() // 移除最旧的数据
  }
}

// 辅助函数：生成交易信号
function generateSignal(
  oiChangePctPositive: number,
  basisPercentNegative: number,
  topTraderAccountLsRatio: number,
): 'long' | 'short' | 'hold' {
  if (
    oiChangePctPositive > 0.02
    && basisPercentNegative > 0.02
    && topTraderAccountLsRatio < 0.8
  ) {
    return basisPercentNegative > 0.03 ? 'long' : 'short'
  }

  return 'hold'
}
