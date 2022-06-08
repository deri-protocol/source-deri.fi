import { ContractBase, fromWei } from '../../shared'
import { pTokenOptionAbi } from './abis.js'

export class PTokenOption extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, pTokenOptionAbi)
  }

  // query
  async balanceOf(owner) {
    const res = await this._call('balanceOf', [owner])
    return res
  }
  async exists(owner) {
    const res = await this._call('exists', [owner])
    return res
  }
  async getActiveSymbolIds() {
    const res = await this._call('getActiveSymbolIds', [])
    return res
  }
  async getApproved(tokenId) {
    const res = await this._call('getApproved', [tokenId])
    return res
  }
  async getMargin(owner) {
    const res = await this._call('getMargin', [owner])
    return fromWei(res)
  }
  async getNumPositionHolders(symbolId) {
    const res = await this._call('getNumPositionHolders', [symbolId])
    return res
  }
  async getPosition(owner, symbolId) {
    const res = await this._call('getPosition', [owner, symbolId])
    return {
      volume: fromWei(res[0]),
      cost: fromWei(res[1]),
      lastCumulativePremiumFundingRate: fromWei(res[2]),
    };
 }
  async getTokenId(owner) {
    const res = await this._call('getTokenId', [owner])
    return res
  }
  async isActiveSymbolId(symbolId) {
    const res = await this._call('isActiveSymbolId', [symbolId])
    return res
  }
  async isApprovedForAll(owner, operator) {
    const res = await this._call('isApprovedForAll', [owner, operator])
    return res
  }
  async name() {
    const res = await this._call('name', [])
    return res
  }
  async ownerOf(tokenId) {
    const res = await this._call('ownerOf', [tokenId])
    return res
  }
  async pool() {
    const res = await this._call('pool', [])
    return res
  }
  async symbol() {
    const res = await this._call('symbol', [])
    return res
  }
  async totalMinted() {
    const res = await this._call('totalMinted', [])
    return res
  }
  async totalSupply() {
    const res = await this._call('totalSupply', [])
    return res
  }

  // tx
  async addMargin(accountAddress, owner, delta) {
    return await this._transact('addMargin', [owner, delta], accountAddress)
  }
  async updateMargin(accountAddress, owner, margin) {
    return await this._transact('updateMargin', [owner, margin], accountAddress)
  }
  async updatePosition(accountAddress, owner, symbolId, position) {
    return await this._transact('updatePosition', [owner, symbolId, position], accountAddress)
  }

  // async approve(accountAddress, operator, tokenId) {
  //   return await this._transact('approve', [operator, tokenId], accountAddress)
  // }
  // async safeTransferFrom(accountAddress, from, to, tokenId) {
  //   return await this._transact('safeTransferFrom', [from, to, tokenId], accountAddress)
  // }
  // async safeTransferFrom(accountAddress, from, to, tokenId, data) {
  //   return await this._transact('safeTransferFrom', [from, to, tokenId, data], accountAddress)
  // }
  // async setApprovalForAll(accountAddress, operator, approved) {
  //   return await this._transact('setApprovalForAll', [operator, approved], accountAddress)
  // }
  // async toggleCloseOnly(accountAddress, symbolId) {
  //   return await this._transact('toggleCloseOnly', [symbolId], accountAddress)
  // }
  // async transferFrom(accountAddress, from, to, tokenId) {
  //   return await this._transact('transferFrom', [from, to, tokenId], accountAddress)
  // }
}