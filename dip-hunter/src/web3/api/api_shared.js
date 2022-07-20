import { bg } from "../utils/bignumber"
import { DeriEnv } from "../utils/env"
import { fetchJson, getHttpBase } from "../utils/rest"

// utils
const tradeHistoryUrl = (chainId, poolAddress, accountAddress) =>
  `${getHttpBase(DeriEnv.get())}/trade_history/${chainId}/${poolAddress}/${accountAddress}/0`

export const getLastTradeRecord = async (chainId, poolAddress, accountAddress) => {
  let res = await fetchJson(tradeHistoryUrl(chainId, poolAddress, accountAddress))
  res = res.data.tradeHistory || []
  const sortedList = res.sort((a, b) => parseInt(b.time) - parseInt(a.time))
  if (sortedList.length > 0) {
    return sortedList[0]
  } else {
    return {}
  }
}

export const symbolCacheKey = (chainId, symbol) => `${chainId}_${symbol}_symbol`
export const positionCacheKey = (chainId, symbol, account) => `${chainId}_${symbol}_${account}_position`
export const marginCacheKey = (chainId, symbol, account) => `${chainId}_${symbol}_${account}_margin`

export const normalizeTradeVolume = (volume, minTradeVolume) =>
  bg(bg(volume)
    .div(minTradeVolume)
    .toFixed(0))
    .times(minTradeVolume)
    .abs()
    .toString();
