import { ContractBase } from '../../shared/contract'
import { deriToNatural } from '../../shared/utils'
import { pTokenLiteAbi } from './abis';

const processPosition = (res) => {
  return {
    volume: deriToNatural(res.volume),
    cost: deriToNatural(res.cost),
    lastCumulativeFundingRate: deriToNatural(res.lastCumulativeFundingRate),
  }
}
export class PTokenLite extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, pTokenLiteAbi)
  }

  // === query ===
  async pool() {
    return await this._call('pool');
  }
  async balanceOf(accountAddress) {
    return await this._call('balanceOf', [accountAddress]);
  }
  async exists(accountAddress) {
    return await this._call('exists', [accountAddress]);
  }
  async ownerOf(tokenId) {
    return await this._call('ownerOf', [tokenId]);
  }
  async getMargin(accountAddress) {
    const res = await this._call('getMargin', [accountAddress]);
    return deriToNatural(res)
  }
  async getPosition(accountAddress, symbolId) {
    const res = await this._call('getPosition', [accountAddress, symbolId]);
    if (Array.isArray(res)) {
      return processPosition(res)
    } else {
      throw new Error(`PToken#getMargin: invalid result with (${accountAddress})`)
    }
  }
  async getActiveSymbolIds() {
    return await this._call('getActiveSymbolIds');
  }
  async isActiveSymbolId(symbolId) {
    return await this._call('isActiveSymbolId', [symbolId]);
  }
  async isApprovedForAll(owner, operator) {
    return await this._call('isApprovedForAll', [owner, operator]);
  }
  async getApproved(tokenId) {
    return await this._call('getApproved', [tokenId]);
  }
  async getNumPositionHolders(symbolId) {
    return await this._call('getNumPositionHolders', [symbolId]);
  }

  // === transaction ===
}
