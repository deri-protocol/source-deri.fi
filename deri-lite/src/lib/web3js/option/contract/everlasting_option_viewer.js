import { ContractBase, deleteIndexedKey, fromWeiForObject } from '../../shared';
import { everlastingOptionViewerAbi } from './abis';

export class EverlastingOptionViewer extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, everlastingOptionViewerAbi);
  }

  // query
  async _getTraderPortfolio(state, account) {
    const res = await this._call('_getTraderPortfolio', [state, account]);
    return res;
  }
  async _initState(poolAddress, oraclePrices) {
    const res = await this._call('_initState', [poolAddress, oraclePrices]);
    return res;
  }
  async _updateSymbolPrices(state) {
    const res = await this._call('_updateSymbolPrices', [state]);
    return res;
  }
  async getPoolStates(poolAddress, oraclePrices, oracleVolatilities) {
    const res = await this._call('getPoolStates', [poolAddress, oraclePrices, oracleVolatilities]);
    const symbolState = res[2].reduce((acc, i) => {
      const symbol = fromWeiForObject(deleteIndexedKey(i), [
        'multiplier',
        'strikePrice',
        'spotPrice',
        'dpmmPrice',
        'dynamicMarginRatio',
        'intrinsicValue',
        'timeValue',
        'delta',
        'alpha',
        'K',
        'tradersNetVolume',
        'tradersNetCost',
        //'cumulativeDeltaFundingRate',
        'cumulativeFundingRate',
        //'deltaFundingPerSecond',
        'fundingPerSecond',
        'volatility',
      ]);
      return acc.concat([symbol])
    }, [])
    return {
      poolState: fromWeiForObject(deleteIndexedKey(res[0]), [
        'initialMarginRatio',
        'maintenanceMarginRatio',
        'fundingPeriod',
        'fundingCoefficient',
        'liquidity',
        'totalDynamicEquity',
        'totalInitialMargin',
      ]),
      symbolState,
    };
  }
  async getTraderStates(poolAddress, account, oraclePrices, oracleVolatilities) {
    const res = await this._call('getTraderStates', [
      poolAddress,
      account,
      oraclePrices,
      oracleVolatilities,
    ]);
    const symbolState = res[2].reduce((acc, i) => {
      const symbol = fromWeiForObject(deleteIndexedKey(i), [
        'multiplier',
        'strikePrice',
        'spotPrice',
        'dpmmPrice',
        'dynamicMarginRatio',
        'intrinsicValue',
        'timeValue',
        'delta',
        'alpha',
        'K',
        'tradersNetVolume',
        'tradersNetCost',
        'cumulativeFundingRate',
        //'deltaFundingPerSecond',
        'fundingPerSecond',
        'volatility',
      ]);
      return acc.concat([symbol])
    }, [])
    const positionState = res[3].reduce((acc, i) => {
      const position = fromWeiForObject(deleteIndexedKey(i), [
        'volume',
        'cost',
        'pnl',
        //'lastCumulativeDeltaFundingRate',
        'lastCumulativeFundingRate',
        //'deltaFundingAccrued',
        'fundingAccrued',
      ])
      return acc.concat([position])
    }, [])
    return {
      poolState: fromWeiForObject(deleteIndexedKey(res[0]), [
        'initialMarginRatio',
        'maintenanceMarginRatio',
        'fundingPeriod',
        'fundingCoefficient',
        'liquidity',
        'totalDynamicEquity',
        'totalInitialMargin',
      ]),
      traderState: fromWeiForObject(deleteIndexedKey(res[1]), [
        'margin',
        'totalPnl',
        'totalFundingAccrued',
        'dynamicMargin',
        'initialMargin',
        'maintenanceMargin',
      ]),
      symbolState: symbolState,
      positionState: positionState,
    };
  }
  async getVolatilityOracles(poolAddress) {
    const res = await this._call('getVolatilityOracles', [poolAddress]);
    return res;
  }
  async getPriceOracles(poolAddress) {
    const res = await this._call('getPriceOracles', [poolAddress]);
    return res;
  }

  // tx
}
