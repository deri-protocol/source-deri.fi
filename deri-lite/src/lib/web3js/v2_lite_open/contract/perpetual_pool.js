import {
  bTokenFactory,
  deriToNatural,
  fetchJson,
  getHttpBase,
} from '../../shared';
import { ContractBase } from '../../shared/contract/contract_base';
import { normalizeSymbolUnit } from '../../shared/config/token';
import { perpetualPoolLiteAbi } from './abis';
import { PTokenLite } from './p_token';

export class PerpetualPoolLite extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, perpetualPoolLiteAbi);
  }

  async init() {
    await this._init();
    if (!this.pTokenAddress|| !this.pToken ) {
      await  this.updateAddresses()
      // console.log(this.addresses, this.parameters)
      //this.bToken = bTokenFactory(this.chainId, bTokenAddress);
      //this.lToken = lTokenLiteFactory(this.chainId, lTokenAddress);
      this.pToken = new PTokenLite(this.chainId, this.pTokenAddress);

    }
  }


  async updateAddresses() {
    if (!this.bTokenAddress || !this.pTokenAddress) {
     const res = await this._call('getAddresses');
    // update this state
     this.bTokenAddress = res.bTokenAddress;
     this.lTokenAddress= res.lTokenAddress;
     this.pTokenAddress= res.pTokenAddress;
    }
  }

  async controller() {
    const res = await this._call('controller');
    return res
  }

  async getParameters() {
    const res = await this._call('getParameters');
    return {
      minPoolMarginRatio: deriToNatural(res.minPoolMarginRatio),
      minInitialMarginRatio: deriToNatural(res.minInitialMarginRatio),
      minMaintenanceMarginRatio: deriToNatural(res.minMaintenanceMarginRatio),
      minLiquidationReward: deriToNatural(res.minLiquidationReward),
      maxLiquidationReward: deriToNatural(res.maxLiquidationReward),
      liquidationCutRatio: deriToNatural(res.liquidationCutRatio),
      protocolFeeCollectRatio: deriToNatural(res.protocolFeeCollectRatio),
    };
  }
  async getSymbol(symbolId) {
    const res = await this._call('getSymbol', [symbolId]);
    return {
      symbol: res.symbol,
      oracleAddress: res.oracleAddress,
      multiplier: deriToNatural(res.multiplier),
      feeRatio: deriToNatural(res.feeRatio),
      fundingRateCoefficient: deriToNatural(res.fundingRateCoefficient),
      price: deriToNatural(res.price),
      cumulativeFundingRate: deriToNatural(res.cumulativeFundingRate),
      tradersNetVolume: deriToNatural(res.tradersNetVolume),
      tradersNetCost: deriToNatural(res.tradersNetCost),
    };
  }
  async getSymbols() {
    await this.updateAddresses()
    if (!this.pToken) {
      this.pToken = new PTokenLite(this.chainId, this.pTokenAddress)
    }
    // update this state
    this.symbolIds = await this.pToken.getActiveSymbolIds()
    this.symbols = await Promise.all(
      this.symbolIds.reduce((acc, i) => acc.concat([this.getSymbol(i)]), [])
    );
    return this.symbols
  }
  async getBTokenSymbol() {
    await this.updateAddresses()
    if (!this.bToken) {
      this.bToken = bTokenFactory(this.chainId, this.bTokenAddress)
    }
    // update this state
    this.bTokenSymbol = await this.bToken.symbol()
    return this.bTokenSymbol
  }
  async getPoolExtraInfo() {
    const url = `${getHttpBase()}/pool_extra_info/${this.contractAddress}`
    const res = await fetchJson(url)
    //console.log(res)
    if (res.success) {
      return res.data
    } else {

      console.log(`-- getInitialBlock(): ${url} => ${res.message}`)
      return  {
        block_number: '1000000000',
        version: '',
      }
    }
  }
  async getConfig() {
    const [bToken, symbols, extraInfo] = await Promise.all([
      this.getBTokenSymbol(),
      this.getSymbols(),
      this.getPoolExtraInfo(),
    ])
    return {
      pool: this.contractAddress,
      pToken: this.pTokenAddress,
      lToken: this.lTokenAddress,
      bToken: this.bTokenAddress,
      bTokenSymbol: bToken,
      symbols: symbols.map((s, index) => ({
        symbolId: this.symbolIds[index],
        symbol: s.symbol,
        unit: normalizeSymbolUnit(s.symbol),
      })),
      initialBlock:extraInfo.block_number,
      type: 'perpetual',
      version:extraInfo.version,
      versionId: 'v2_lite',
      chainId: this.chainId,
    }
  }

  // tx
  async addSymbol(accountAddress, parameters) {
    return await this._transact('addSymbol', parameters, accountAddress)
  }

  async removeSymbol(accountAddress, symbolId) {
    return await this._transact('removeSymbol', [symbolId], accountAddress)
  }
}
