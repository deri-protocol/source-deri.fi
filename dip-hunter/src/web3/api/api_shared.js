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