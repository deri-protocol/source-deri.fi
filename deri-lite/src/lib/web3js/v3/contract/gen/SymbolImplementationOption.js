// this file is generated by script, don't modify it !!!
import { ContractBase } from '../../../shared/contract/contract_base.js'
import { deleteIndexedKey } from '../../../shared/utils/web3.js'
import { symbolImplementationOptionAbi } from '../abi/symbolImplementationOptionAbi.js'

export class SymbolImplementationOption extends ContractBase {
  // init
  constructor(chainId, contractAddress, opts = {}) {
    super(chainId, contractAddress, symbolImplementationOptionAbi)
    // for pool use
    this.initialBlock = opts.initialBlock || ""
  }

  // query
  async admin() {
    const res = await this._call('admin', [])
    return deleteIndexedKey(res)
  }
  async alpha() {
    const res = await this._call('alpha', [])
    return deleteIndexedKey(res)
  }
  async cumulativeFundingPerVolume() {
    const res = await this._call('cumulativeFundingPerVolume', [])
    return deleteIndexedKey(res)
  }
  async feeRatioITM() {
    const res = await this._call('feeRatioITM', [])
    return deleteIndexedKey(res)
  }
  async feeRatioOTM() {
    const res = await this._call('feeRatioOTM', [])
    return deleteIndexedKey(res)
  }
  async fundingPeriod() {
    const res = await this._call('fundingPeriod', [])
    return deleteIndexedKey(res)
  }
  async fundingTimestamp() {
    const res = await this._call('fundingTimestamp', [])
    return deleteIndexedKey(res)
  }
  async hasPosition(pTokenId) {
    const res = await this._call('hasPosition', [pTokenId])
    return deleteIndexedKey(res)
  }
  async implementation() {
    const res = await this._call('implementation', [])
    return deleteIndexedKey(res)
  }
  async indexPrice() {
    const res = await this._call('indexPrice', [])
    return deleteIndexedKey(res)
  }
  async initialMarginRatio() {
    const res = await this._call('initialMarginRatio', [])
    return deleteIndexedKey(res)
  }
  async initialMarginRequired() {
    const res = await this._call('initialMarginRequired', [])
    return deleteIndexedKey(res)
  }
  async isCall() {
    const res = await this._call('isCall', [])
    return deleteIndexedKey(res)
  }
  async isCloseOnly() {
    const res = await this._call('isCloseOnly', [])
    return deleteIndexedKey(res)
  }
  async maintenanceMarginRatio() {
    const res = await this._call('maintenanceMarginRatio', [])
    return deleteIndexedKey(res)
  }
  async manager() {
    const res = await this._call('manager', [])
    return deleteIndexedKey(res)
  }
  async minTradeVolume() {
    const res = await this._call('minTradeVolume', [])
    return deleteIndexedKey(res)
  }
  async nPositionHolders() {
    const res = await this._call('nPositionHolders', [])
    return deleteIndexedKey(res)
  }
  async nameId() {
    const res = await this._call('nameId', [])
    return deleteIndexedKey(res)
  }
  async netCost() {
    const res = await this._call('netCost', [])
    return deleteIndexedKey(res)
  }
  async netVolume() {
    const res = await this._call('netVolume', [])
    return deleteIndexedKey(res)
  }
  async oracleManager() {
    const res = await this._call('oracleManager', [])
    return deleteIndexedKey(res)
  }
  async positions(pTokenId) {
    const res = await this._call('positions', [pTokenId])
    return deleteIndexedKey(res)
  }
  async priceId() {
    const res = await this._call('priceId', [])
    return deleteIndexedKey(res)
  }
  async pricePercentThreshold() {
    const res = await this._call('pricePercentThreshold', [])
    return deleteIndexedKey(res)
  }
  async strikePrice() {
    const res = await this._call('strikePrice', [])
    return deleteIndexedKey(res)
  }
  async symbol() {
    const res = await this._call('symbol', [])
    return deleteIndexedKey(res)
  }
  async symbolId() {
    const res = await this._call('symbolId', [])
    return deleteIndexedKey(res)
  }
  async timeThreshold() {
    const res = await this._call('timeThreshold', [])
    return deleteIndexedKey(res)
  }
  async tradersPnl() {
    const res = await this._call('tradersPnl', [])
    return deleteIndexedKey(res)
  }
  async versionId() {
    const res = await this._call('versionId', [])
    return deleteIndexedKey(res)
  }
  async volatilityId() {
    // const res = await this._call('volatilityId', [])
    await this._init()
    const res = await this.contract.methods.volatilityId().call()
    return deleteIndexedKey(res)
  }

  // tx
  //  async setAdmin(accountAddress, newAdmin) {
  //    return await this._transact('setAdmin', [newAdmin], accountAddress)
  //  }
  //  async settleOnAddLiquidity(accountAddress, liquidity) {
  //    return await this._transact('settleOnAddLiquidity', [liquidity], accountAddress)
  //  }
  //  async settleOnLiquidate(accountAddress, pTokenId, liquidity) {
  //    return await this._transact('settleOnLiquidate', [pTokenId, liquidity], accountAddress)
  //  }
  //  async settleOnRemoveLiquidity(accountAddress, liquidity, removedLiquidity) {
  //    return await this._transact('settleOnRemoveLiquidity', [liquidity, removedLiquidity], accountAddress)
  //  }
  //  async settleOnTrade(accountAddress, pTokenId, tradeVolume, liquidity) {
  //    return await this._transact('settleOnTrade', [pTokenId, tradeVolume, liquidity], accountAddress)
  //  }
  //  async settleOnTraderWithPosition(accountAddress, pTokenId, liquidity) {
  //    return await this._transact('settleOnTraderWithPosition', [pTokenId, liquidity], accountAddress)
  //  }

}