// v2 lite
export {
  getLiquidityInfo as getLiquidityInfoV2l,
  getPoolLiquidity as getPoolLiquidityV2l,
  getPoolInfoApy as getPoolInfoApyV2l,
} from './mining_query_api'

export {
  addLiquidity as addLiquidityV2l,
  removeLiquidity as removeLiquidityV2l,
} from './mining_transaction_api'

export {
  getSpecification as getSpecificationV2l,
  getPositionInfo as getPositionInfoV2l,
  getPositionInfos as getPositionInfosV2l,
  isUnlocked as isUnlockedV2l,
  getWalletBalance as getWalletBalanceV2l,
  getEstimatedFee as getEstimatedFeeV2l,
  getEstimatedMargin as getEstimatedMarginV2l,
  getFundingRate as getFundingRateV2l,
  getEstimatedFundingRate as getEstimatedFundingRateV2l,
  getLiquidityUsed as getLiquidityUsedV2l,
  getEstimatedLiquidityUsed as getEstimatedLiquidityUsedV2l,
  getFundingRateCache as getFundingRateCacheV2l,
  // getPoolBTokensBySymbolId ,
  // getFundingFee,
} from './trade_query_api';

export {
  unlock as unlockV2l,
  depositMargin as depositMarginV2l,
  withdrawMargin as withdrawMarginV2l,
  tradeWithMargin as tradeWithMarginV2l,
  closePosition as closePositionV2l,
} from './trade_transaction_api';

export { getTradeHistory as getTradeHistoryV2l } from './trade_history_api';