// v2
export {
  getLiquidityInfo as getLiquidityInfoV2,
  getPoolLiquidity as getPoolLiquidityV2,
  getPoolInfoApy as getPoolInfoApyV2,
} from './mining_query_api'

export {
  addLiquidity as addLiquidityV2,
  removeLiquidity as removeLiquidityV2,
  addLiquidityWithPrices as addLiquidityWithPricesV2,
  removeLiquidityWithPrices as removeLiquidityWithPricesV2,
} from './mining_transaction_api'

export {
  getSpecification as getSpecificationV2,
  getPositionInfo as getPositionInfoV2,
  getPositionInfos as getPositionInfosV2,
  isUnlocked as isUnlockedV2,
  getWalletBalance as getWalletBalanceV2,
  getEstimatedFee as getEstimatedFeeV2,
  getEstimatedMargin as getEstimatedMarginV2,
  getFundingRate as getFundingRateV2,
  getEstimatedFundingRate as getEstimatedFundingRateV2,
  getLiquidityUsed as getLiquidityUsedV2,
  getEstimatedLiquidityUsed as getEstimatedLiquidityUsedV2,
  getFundingRateCache as getFundingRateCacheV2,
  getPoolBTokensBySymbolId,
  getFundingFee as getFundingFeeV2,
  getEstimatedLiquidatePrice as getEstimatedLiquidatePriceV2,
} from './trade_query_api';

export {
  unlock as unlockV2,
  depositMargin as depositMarginV2,
  withdrawMargin as withdrawMarginV2,
  tradeWithMargin as tradeWithMarginV2,
  closePosition as closePositionV2,
  depositMarginWithPrices as depositMarginWithPricesV2,
  withdrawMarginWithPrices as withdrawMarginWithPricesV2,
  tradeWithMarginWithPrices as tradeWithMarginWithPricesV2,
  closePositionWithPrices as closePositionWithPricesV2,
} from './trade_transaction_api';

export {
  getTradeHistory as getTradeHistoryV2,
} from './trade_history_api';
