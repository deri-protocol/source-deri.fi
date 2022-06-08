import {
  ContractBase,
  deleteIndexedKey,
  fromWeiForObject,
  fromWei,
  naturalToDeri,
  getPoolConfig,
  getPoolViewerConfig,
  isEqualSet,
  getBlockInfo,
  deriToNatural,
  normalizeOptionSymbol,
  bg,
  MAX_INT256,
} from '../../shared';
import { getVolatilitySymbols } from '../../shared/config/token';
import { getOracleVolatilitiesForOption } from '../../shared/utils/oracle';
import {
  everlastingOptionViewerFactory,
  pTokenOptionFactory,
} from '../factory/tokens';
import { volatilitiesCache } from '../utils';
import { everlastingOptionAbi } from './abis.js';

export class EverlastingOption extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, everlastingOptionAbi);

    this.config = getPoolConfig(
      contractAddress,
      undefined,
      undefined,
      'option'
    );
    // this.offchainSymbolIds = this.config.offchainSymbolIds;
    // this.offchainSymbols = this.config.offchainSymbols;
    this.volatilitySymbols = this.config.volatilitySymbols;
    this.bTokenAddress = this.config.bToken;
    this.lTokenAddress = this.config.lToken;
    this.pTokenAddress = this.config.pToken;
    this.viewerAddress = getPoolViewerConfig(this.chainId, 'option');
  }
  async _updateConfig() {
    if (!this.pToken) {
      this.pToken = pTokenOptionFactory(this.chainId, this.pTokenAddress);
    }
    if (!this.viewer) {
      this.viewer = everlastingOptionViewerFactory(
        this.chainId,
        this.viewerAddress
      );
    }

    const activeSymbolIds = await this.pToken.getActiveSymbolIds();
    if (
      !this.activeSymbolIds ||
      !isEqualSet(new Set(this.activeSymbolIds), new Set(activeSymbolIds))
    ) {
      // symbol is updated
      const activeSymbols = await Promise.all(
        activeSymbolIds.reduce((acc, i) => acc.concat([this.getSymbol(i)]), [])
      );
      const symbolVolatilities = (await volatilitiesCache.get(
        activeSymbols.map((s) => s.symbol)
      )).map((v) => v.volatility);
      //console.log(symbolVolatilities)
      const state = await this.viewer.getPoolStates(
        this.contractAddress,
        [],
        symbolVolatilities
      );
      const { symbolState } = state;

      // update state
      this.activeSymbolIds = activeSymbolIds;
      this.activeSymbols = symbolState.filter((s) =>
        this.activeSymbolIds.includes(s.symbolId)
      );
      this.activeSymbolNames = this.activeSymbols.map((s) => s.symbol)
      // for tx use
      this.volatilitySymbols = getVolatilitySymbols(
        this.activeSymbols.map((s) => s.symbol)
      );

      this.symbols = await Promise.all(
        this.activeSymbolIds.reduce(
          (acc, symbolId) => [...acc, this.getSymbol(symbolId)],
          []
        )
      );
    }
  }

  // query
  // async OptionPricer() {
  //   const res = await this._call('OptionPricer', []);
  //   return res;
  // }
  // async PmmPricer() {
  //   const res = await this._call('PmmPricer', []);
  //   return res;
  // }
  // async _T() {
  //   const res = await this._call('_T', []);
  //   return fromWei(res);
  // }
  async getAddresses() {
    const res = await this._call('getAddresses', []);
    return deleteIndexedKey(res);
  }
  async getLastTimestamp() {
    const res = await this._call('getPoolStateValues', []);
    return res[1];
  }
  async getLiquidity() {
    const res = await this._call('getPoolStateValues', []);
    return fromWei(res[0]);
  }
  async getParameters() {
    const res = await this._call('getParameters', []);
    return fromWeiForObject(deleteIndexedKey(res), [
      'initialMarginRatio',
      'liquidationCutRatio',
      'maintenanceMarginRatio',
      'maxLiquidationReward',
      'minLiquidationReward',
      'minPoolMarginRatio',
      'protocolFeeCollectRatio',
    ]);
  }
  // async getProtocolFeeAccrued() {
  //   const res = await this._call('getPoolStateValues', []);
  //   return fromWei(res[2])
  // }

  async getSymbol(symbolId) {
    const res = await this._call('getSymbol', [symbolId]);
    return fromWeiForObject(deleteIndexedKey(res), [
      'strikePrice',
      'multiplier',
      'feeRatioITM',
      'feeRatioOTM',
      'alpha',
      'tradersNetVolume',
      'tradersNetCost',
      'cumulativeFundingRate',
    ]);
  }
  async updateSymbols() {
    if (!this.pToken) {
      this.pToken = pTokenOptionFactory(this.chainId, this.pTokenAddress);
    }
    if (!this.activeSymbolIds) {
      this.activeSymbolIds = await this.pToken.getActiveSymbolIds();
    }
    this.activeSymbols = await Promise.all(
      this.activeSymbolIds.reduce(
        (acc, i) => acc.concat([this.getSymbol(i)]),
        []
      )
    );
    return this.activeSymbols
  }

  // tx
  async _getVolSymbolPrices() {
    await this._updateConfig();
    let volatilities = [];
    let oracleSymbols = []
    if (this.volatilitySymbols.length > 0) {
      const volatilityInfos = await getOracleVolatilitiesForOption(
        this.activeSymbols.map((s) => s.symbol)
      );
      volatilities = Object.values(volatilityInfos).reduce((acc, p, index) => {
        const oracleSymbol = normalizeOptionSymbol(this.activeSymbolNames[index])
        if (!oracleSymbols.includes(oracleSymbol)) {
          oracleSymbols.push(oracleSymbol)
          acc.push([
            this.activeSymbolIds[index],
            p.timestamp,
            p.volatility,
            parseInt(p.v).toString(),
            p.r,
            p.s,
          ]);
        }
        return acc;
      }, []);
    }
    //console.log('prices', prices);
    return volatilities;
  }

  async addLiquidity(accountAddress, bAmount) {
    const prices = await this._getVolSymbolPrices();
    return await this._transact(
      'addLiquidity',
      [naturalToDeri(bAmount), prices],
      accountAddress
    );
  }
  async removeLiquidity(accountAddress, lShares) {
    const prices = await this._getVolSymbolPrices();
    let amount = naturalToDeri(lShares);
    return await this._transact(
      'removeLiquidity',
      [amount, prices],
      accountAddress
    );
  }
  async addMargin(accountAddress, bAmount) {
    return await this._transact(
      'addMargin',
      [naturalToDeri(bAmount)],
      accountAddress
    );
  }
  async removeMargin(accountAddress, bAmount) {
    const prices = await this._getVolSymbolPrices();
    return await this._transact(
      'removeMargin',
      [naturalToDeri(bAmount), prices],
      accountAddress
    );
  }
  async trade(accountAddress, symbolId, tradeVolume) {
    const prices = await this._getVolSymbolPrices();
    return await this._transact(
      'trade',
      [symbolId, naturalToDeri(tradeVolume), prices],
      accountAddress
    );
  }

  // trade history
  async formatTradeEvent(event) {
    const info = event.returnValues;
    const tradeVolume = deriToNatural(info.tradeVolume).toString();
    const block = await getBlockInfo(this.chainId, event.blockNumber);
    const symbolId = info.symbolId;
    const indexPrice = deriToNatural(info.indexPrice).toString();
    const index = this.activeSymbolIds.indexOf(symbolId);
    if (index > -1) {
      const symbol = this.symbols[index];
      const tradeFee = info.tradeFee;

      const direction =
        tradeFee !== "-1"
          ? bg(tradeVolume).gt(0)
            ? "LONG"
            : "SHORT"
          : "LIQUIDATION";
      const price = bg(info.tradeCost)
        .div(info.tradeVolume)
        .div(symbol.multiplier)
        .toString();
      const notional = bg(tradeVolume)
        .abs()
        .times(indexPrice)
        .times(symbol.multiplier)
        .toString();
      const contractValue = bg(tradeVolume)
        .abs()
        .times(price)
        .times(symbol.multiplier)
        .toString();

      const res = {
        symbolId: info.symbolId,
        symbol: symbol.symbol,
        trader: info.trader,
        direction,
        volume: bg(tradeVolume).abs().toString(),
        price,
        indexPrice,
        notional,
        contractValue,
        transactionFee:
          tradeFee === "-1" ? "0" : deriToNatural(tradeFee).toString(),
        transactionHash: event.transactionHash,
        time: block.timestamp * 1000,
        extra: {},
      };
      //console.log(JSON.stringify(res));
      return res;
    } else {
      return null;
    }
  }
}
