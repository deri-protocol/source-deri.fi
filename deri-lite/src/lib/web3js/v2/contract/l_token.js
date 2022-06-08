import { ContractBase } from '../../shared/contract/contract_base'
import { deriToNatural } from '../../shared/utils'
import { lTokenAbi } from './abis';

const processAsset = (res) => {
  return {
    liquidity: deriToNatural(res[0]),
    pnl: deriToNatural(res[1]),
    lastCumulativePnl: deriToNatural(res[2]),
  }
}
export class LToken extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, lTokenAbi)
  }

  // === query ===
  async balanceOf(accountAddress) {
    return await this._call('balanceOf', [accountAddress]);
  }
  async pool() {
    return await this._call('pool');
  }
  async exists(accountAddress) {
    return await this._call('exists', [accountAddress]);
  }
  async getAsset(accountAddress, bTokenId) {
    const res = await this._call('getAsset', [accountAddress, bTokenId]);
    if (Array.isArray(res)) {
      return processAsset(res)
    } else {
      console.log('address', this.contractAddress)
      console.log('res', res)
      throw new Error(`LToken#getAsset: invalid result with (${accountAddress} ${bTokenId})`)
    }
  }
  async getAssets(accountAddress) {
    const res = await this._call('getAssets', [accountAddress]);
    if (Array.isArray(res)) {
      return res.map(i => processAsset(i))
    } else {
      throw new Error(`LToken#getAsset: invalid result with (${accountAddress})`)
    }
  }

  // === transaction ===
}