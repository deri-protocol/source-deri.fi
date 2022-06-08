import {
  //getPoolConfig,
  ContractBase,
  deriToNatural,
  naturalToDeri,
  //isEqualSet,
  bTokenFactory,
} from '../../shared';
import { checkOffChainOracleSymbol, getPriceInfos } from '../../shared/utils/oracle';
import { perpetualPoolLiteOldAbi} from './abis';
import { lTokenLiteFactory, pTokenLiteFactory } from '../factory';

export class PerpetualPoolLiteOld extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, perpetualPoolLiteOldAbi);
  }

  async init() {
    // init web3 and contract
    await this._init();
    // init address and parameters
    if (!this.addresses || !this.pToken) {
      [this.addresses, this.parameters] = await Promise.all([
        this.getAddresses(),
        this.getParameters(),
      ]);
      const { bTokenAddress, lTokenAddress, pTokenAddress } = this.addresses;
      // init bToken, pToken and lToken
      this.bToken = bTokenFactory(this.chainId, bTokenAddress);
      this.pToken = pTokenLiteFactory(this.chainId, pTokenAddress);
      this.lToken = lTokenLiteFactory(this.chainId, lTokenAddress);
      this.bTokenSymbol = await this.bToken.symbol();
    }
    const symbolIds = await this.pToken.getActiveSymbolIds();
    // update symbolIds
    if (
      !this.activeSymbolIds ||
      this.activeSymbolIds.toString() !== symbolIds.toString() ||
      this.offChainOracleSymbolIds == null
    ) {
      this.activeSymbolIds = symbolIds;
      this.symbols = await Promise.all(
        this.activeSymbolIds.reduce(
          (acc, symbolId) => [...acc, this.getSymbol(symbolId)],
          []
        )
      );
      this.activeSymbolNames = this.symbols.map((s) => s.symbol);
      this.offChainOracleSymbols = await Promise.all(
        this.symbols
          .map((s) => s.oracleAddress)
          .reduce(
            (acc, o, index) => [
              ...acc,
              checkOffChainOracleSymbol(
                this.chainId,
                o,
                this.symbols[index].symbol
              ),
            ],
            []
          )
      );
      this.offChainOracleSymbolIds = this.activeSymbolIds.reduce(
        (acc, i, index) => {
          return this.offChainOracleSymbols[index] === '' ? acc : [...acc, i];
        },
        []
      );
      this.offChainOracleSymbols = this.offChainOracleSymbols.filter(
        (s) => s && s !== ''
      );
      //console.log('offchain', this.offChainOracleSymbols);
    }
  }

  // update symbols
  async getSymbols() {
    await this.init()
    this.symbols = await Promise.all(
      this.activeSymbolIds.reduce(
        (acc, symbolId) => [...acc, this.getSymbol(symbolId)],
        []
      )
    );
    return this.symbols
  }

  // update positions
  async getPositions(accountAddress) {
    await this.init()
    this.positions = await Promise.all(
      this.activeSymbolIds.reduce(
        (acc, symbolId) => [
          ...acc,
          this.pToken.getPosition(accountAddress, symbolId),
        ],
        []
      )
    );
    return this.positions
  }

  async getAddresses() {
    const res = await this._call('getAddresses');
    return res;
  }
  async getParameters() {
    const res = await this._call('getParameters');
    return {
      // decimals0: res.decimals0,
      // minBToken0Ratio: deriToNatural(res.minBToken0Ratio),
      minPoolMarginRatio: deriToNatural(res.minPoolMarginRatio),
      minInitialMarginRatio: deriToNatural(res.minInitialMarginRatio),
      minMaintenanceMarginRatio: deriToNatural(res.minMaintenanceMarginRatio),
      minLiquidationReward: deriToNatural(res.minLiquidationReward),
      maxLiquidationReward: deriToNatural(res.maxLiquidationReward),
      liquidationCutRatio: deriToNatural(res.liquidationCutRatio),
      protocolFeeCollectRatio: deriToNatural(res.protocolFeeCollectRatio),
    };
  }
  async getLastUpdateBlock() {
    const res = await this._call('getLastUpdateBlock');
    return parseInt(res);
  }
  async getProtocolFeeAccrued() {
    const res = await this._call('getProtocolFeeAccrued');
    return deriToNatural(res);
  }
  async getLiquidity() {
    const res = await this._call('getLiquidity');
    return deriToNatural(res);
  }
  // async getBTokenOracle(bTokenId) {
  //   //bTokenId = parseInt(bTokenId)
  //   return await this._call('getBTokenOracle', [bTokenId])
  // }
  async getSymbol(symbolId) {
    //symbolId = parseInt(symbolId)
    try {
      const res = await this._call('getSymbol', [symbolId]);
      return {
        symbol: res.symbol,
        symbolId: res.symbolId,
        oracleAddress: res.oracleAddress,
        multiplier: deriToNatural(res.multiplier),
        feeRatio: deriToNatural(res.feeRatio),
        fundingRateCoefficient: deriToNatural(res.fundingRateCoefficient),
        price: deriToNatural(res.price),
        cumulativeFundingRate: deriToNatural(res.cumulativeFundingRate),
        tradersNetVolume: deriToNatural(res.tradersNetVolume),
        tradersNetCost: deriToNatural(res.tradersNetCost),
      };
    } catch (err) {
      throw new Error(`PerpetualPool#getSymbol error: ${err}`);
    }
  }

  // async getSymbolOracle(symbolId) {
  //   //symbolId = parseInt(symbolId)
  //   return await this._call('getSymbolOracle', [symbolId])
  // }

  async _getSymbolPrices() {
    let prices = [];
    await this.init()
    if (this.offChainOracleSymbolIds.length > 0) {
      const priceInfos = await getPriceInfos(this.offChainOracleSymbols);
      prices = Object.values(priceInfos).reduce((acc, p, index) => {
        acc.push([
          this.offChainOracleSymbolIds[
            this.offChainOracleSymbols.indexOf(Object.keys(priceInfos)[index])
          ],
          p.timestamp,
          p.price,
          parseInt(p.v).toString(),
          p.r,
          p.s,
        ]);
        return acc;
      }, []);
    }
    //console.log('prices', prices);
    return prices;
  }

  // === transaction ===
  async addLiquidity(accountAddress, amount) {
    const prices = await this._getSymbolPrices();
    return await this._transact(
      'addLiquidity',
      [naturalToDeri(amount), prices],
      accountAddress
    );
  }
  async removeLiquidity(accountAddress, amount) {
    const prices = await this._getSymbolPrices();
    return await this._transact(
      'removeLiquidity',
      [naturalToDeri(amount), prices],
      accountAddress
    );
  }

  async addMargin(accountAddress, amount) {
    const prices = await this._getSymbolPrices();
    return await this._transact(
      'addMargin',
      [naturalToDeri(amount), prices],
      accountAddress
    );
  }

  async removeMargin(accountAddress, amount) {
    const prices = await this._getSymbolPrices();
    return await this._transact(
      'removeMargin',
      [naturalToDeri(amount), prices],
      accountAddress
    );
  }

  async trade(accountAddress, symbolId, newVolume) {
    const prices = await this._getSymbolPrices();
    return await this._transact(
      'trade',
      [symbolId, naturalToDeri(newVolume), prices],
      accountAddress
    );
  }
}
