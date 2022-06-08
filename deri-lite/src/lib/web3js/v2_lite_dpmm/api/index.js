import {
  getPoolInfoApy,
  getPoolLiquidity,
} from '../../shared/api/database_api';
import {
  getEstimatedFee,
  getEstimatedFundingRate,
  getEstimatedLiquidityUsed,
  getEstimatedMargin,
  getFundingRate,
  getLiquidityInfo,
  getLiquidityUsed,
  getPositionInfo,
  getPositionInfos,
  getSpecification,
  getWalletBalance,
  isUnlocked,
  getEstimatedTimePrice,
} from './query_api';
import { getTradeHistory } from './trade_history_api';
import {
  addLiquidity,
  closePosition,
  depositMargin,
  removeLiquidity,
  tradeWithMargin,
  unlock,
  withdrawMargin,
} from './transaction_api';

export const api = {
  // mining
  getLiquidityInfo,
  getPoolLiquidity,
  getPoolInfoApy,
  addLiquidity,
  removeLiquidity,
  // trading
  getSpecification,
  getPositionInfo,
  getPositionInfos,
  getWalletBalance,
  isUnlocked,
  getEstimatedFee,
  getEstimatedMargin,
  getFundingRate,
  getEstimatedFundingRate,
  getLiquidityUsed,
  getEstimatedLiquidityUsed,
  getEstimatedTimePrice,
  getFundingRateCache: () => {},
  unlock,
  depositMargin,
  withdrawMargin,
  tradeWithMargin,
  closePosition,
  // tradeHistory
  getTradeHistory,
};
