import { ContractBase, fromWei } from '../../shared'
import { lTokenOptionAbi } from './abis.js'

export class LTokenOption extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, lTokenOptionAbi)
  }

  // query
  // async allowance(owner, spender) {
  //   const res = await this._call('allowance', [owner, spender])
  //   return res
  // }
  async balanceOf(account) {
    const res = await this._call('balanceOf', [account])
    return fromWei(res)
  }
  async name() {
    const res = await this._call('name', [])
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
  async totalSupply() {
    const res = await this._call('totalSupply', [])
    return fromWei(res)
  }

  // tx
  // async approve(accountAddress, spender, amount) {
  //   return await this._transact('approve', [spender, amount], accountAddress)
  // }
  // async transfer(accountAddress, to, amount) {
  //   return await this._transact('transfer', [to, amount], accountAddress)
  // }
  // async transferFrom(accountAddress, from, to, amount) {
  //   return await this._transact('transferFrom', [from, to, amount], accountAddress)
  // }

}