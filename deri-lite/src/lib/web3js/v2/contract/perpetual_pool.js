import { ContractBase } from '../../shared/contract/contract_base'
import { deriToNatural, hexToNumber, bg } from '../../shared/utils'
import { perpetualPoolAbi } from './abis';

export class PerpetualPool extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, perpetualPoolAbi)

    this.bTokenCount= 0
    this.symbolCount= 0

    this.lTokenAddress = ''
    this.pTokenAddress = ''
    this.routerAddress = ''
    this.protocolFeeCollector = ''

    this.protocolFeeAccrued = 0
  }

  async _update() {
    await Promise.all([
      this.getLengths(),
      this.getAddresses(),
      this.getParameters(),
    ]);
  }

  async getLengths() {
    try {
      const res = await this._call('getLengths')
      //console.log(res[0])
      if (res[0] && res[1]) {
        this.bTokenCount= parseInt(res[0])
        this.symbolCount= parseInt(res[1])
      }
    } catch(err) {
      throw new Error(`PerpetualPool#_getLength error: ${err}`)
    }
  }
  async getAddresses() {
    try {
      const res = await this._call('getAddresses')
      this.lTokenAddress = res.lTokenAddress
      this.pTokenAddress = res.pTokenAddress
      this.routerAddress = res.routerAddress
      this.protocolFeeCollector = res.protocolFeeCollector
    } catch (err) {
      throw new Error(`PerpetualPool#_getAddress error: ${err}`)
    }
  }
  async getParameters() {
    const res = await this._call('getParameters')
    return {
      decimals0: res.decimals0,
      minBToken0Ratio: deriToNatural(res.minBToken0Ratio),
      minPoolMarginRatio: deriToNatural(res.minPoolMarginRatio),
      minInitialMarginRatio: deriToNatural(res.minInitialMarginRatio),
      minMaintenanceMarginRatio: deriToNatural(res.minMaintenanceMarginRatio),
      minLiquidationReward: deriToNatural(res.minLiquidationReward),
      maxLiquidationReward: deriToNatural(res.maxLiquidationReward),
      liquidationCutRatio: deriToNatural(res.liquidationCutRatio),
      protocolFeeCollectRatio: deriToNatural(res.protocolFeeCollectRatio),
    };
  }
  async getProtocolFeeAccrued() {
    const res =  await this._call('getProtocolFeeAccrued')
    this.protocolFeeAccrued = deriToNatural(res)
  }
  async getBToken(bTokenId) {
    try {
      //bTokenId = parseInt(bTokenId)
      const res = await this._call('getBToken', [bTokenId]);
      return {
        bTokenAddress: res.bTokenAddress,
        swapperAddress: res.bTokenAddress,
        oracleAddress: res.oracleAddress,
        decimals: res.decimals,
        discount: deriToNatural(res.discount),
        price: deriToNatural(res.price),
        liquidity: deriToNatural(res.liquidity),
        pnl: deriToNatural(res.pnl),
        cumulativePnl: deriToNatural(res.cumulativePnl),
      };
    } catch (err) {
      throw new Error(`PerpetualPool#getBToken error: ${err}`);
    }
  }
  async getBTokenOracle(bTokenId) {
    //bTokenId = parseInt(bTokenId)
    return await this._call('getBTokenOracle', [bTokenId])
  }
  async getSymbol(symbolId) {
    //symbolId = parseInt(symbolId)
    try {
      const res =  await this._call('getSymbol', [symbolId])
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
    } catch (err) {
      throw new Error(`PerpetualPool#getSymbol error: ${err}`);
    }
  }
  async getSymbolOracle(symbolId) {
    //symbolId = parseInt(symbolId)
    return await this._call('getSymbolOracle', [symbolId])
  }

  // trade history query methods
  async _getTimeStamp(blockNumber) {
    await this._init()
    return await this.web3.eth.getBlock(blockNumber);
  }

  // get block number when last updated
  async getLastUpdatedBlockNumber() {
    await this._init()
    const res = await this.web3.eth.getStorageAt(this.contractAddress, 0)
    //console.log('res', hexToNumber(res))
    return hexToNumber(res)
  }

  // get block number when last updated
  async getLatestBlockNumber() {
    await this._init()
    const res = await this.web3.eth.getBlockNumber()
    //console.log('res', res)
    return res
  }

  _calculateFee(volume, price, multiplier, feeRatio) {
    return bg(volume)
      .abs()
      .times(price)
      .times(multiplier)
      .times(feeRatio)
      .toString();
  }
  async _getBlockInfo(blockNumber) {
    await this._init()
    return await this.web3.eth.getBlock(blockNumber);
  }

  async _getPastEvents(eventName, filter = {}, fromBlock = 0, to = 0) {
    await this._init()
    let events = [];
    //let toBlock = await this._getBlockInfo("latest");
    let amount
    if (['56', '97','127', '80001'].includes(this.chainId)) {
      amount = 999
    } else {
      amount = 4999
    }
    if ((fromBlock + amount) > to) {
      amount = to - fromBlock
    }
    while (fromBlock <= to) {
      let es = await this.contract.getPastEvents(eventName, {
        filter: filter,
        fromBlock: fromBlock,
        toBlock: fromBlock + amount,
      });
      for (let e of es) {
        events.push(e);
      }
      fromBlock += amount + 1;
      if ((fromBlock + amount) > to) {
        amount = to - fromBlock
      }
    }
    return events;
  }
}