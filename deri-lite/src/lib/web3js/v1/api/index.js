// export shared api
export { priceCache, fundingRateCache } from './api_v1_globals';

export {
  mint,
} from './contract_transaction_api';

// export v1 api
export { getTradeHistory2 } from './rest_api';

export {
  getLiquidityInfo as getLiquidityInfo2,
  getPositionInfo as getPositionInfo2,
  isUnlocked as isUnlocked2,
  getEstimatedMargin as getEstimatedMargin2,
  getEstimatedFee as getEstimatedFee2,
  getEstimatedFundingRate as getEstimatedFundingRate2,
  getEstimatedLiquidityUsed as getEstimatedLiquidityUsed2,
  getWalletBalance as getWalletBalance2,
  getSpecification as getSpecification2,
  getFundingRate as getFundingRate2,
  getLiquidityUsed as getLiquidityUsed2,
  getFundingRateCache as getFundingRateCache2,
} from './contract_query_api';

// export {
//   addLiquidity2,
//   removeLiquidity2,
//   tradeWithMargin2,
//   closePosition2,
//   depositMargin2,
//   withdrawMargin2,
// } from './contract_transaction_api_v2';

export {
  unlock as unlock2,
  addLiquidity as addLiquidity2,
  removeLiquidity as removeLiquidity2,
  tradeWithMargin as tradeWithMargin2,
  closePosition as closePosition2,
  depositMargin as depositMargin2,
  withdrawMargin as withdrawMargin2,
} from './contract_transaction_api';
