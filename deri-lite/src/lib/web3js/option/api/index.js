// v2 lite
export {
  getLiquidityInfo as getLiquidityInfoOption,
} from './mining_query_api'

export {
  addLiquidity as addLiquidityOption,
  removeLiquidity as removeLiquidityOption,
} from './mining_transaction_api'

export {
  getSpecification as getSpecificationOption,
  getPositionInfo as getPositionInfoOption,
  isUnlocked as isUnlockedOption,
  getWalletBalance as getWalletBalanceOption,
  getEstimatedFee as getEstimatedFeeOption,
  getEstimatedMargin as getEstimatedMarginOption,
  getFundingRate as getFundingRateOption,
  getEstimatedFundingRate as getEstimatedFundingRateOption,
  getLiquidityUsed as getLiquidityUsedOption,
  getEstimatedLiquidityUsed as getEstimatedLiquidityUsedOption,
  getFundingRateCache as getFundingRateCacheOption,
  getPositionInfos as getPositionInfosOption,
  getEstimatedTimePrice as getEstimatedTimePriceOption,
  getVolatility,
} from './trade_query_api'

export {
  unlock as unlockOption,
  depositMargin as depositMarginOption,
  withdrawMargin as withdrawMarginOption,
  tradeWithMargin as tradeWithMarginOption, // need check marginHeld and liquidityUsed
  closePosition as closePositionOption,
} from './trade_transaction_api';

export { getTradeHistory as getTradeHistoryOption } from './trade_history_api';