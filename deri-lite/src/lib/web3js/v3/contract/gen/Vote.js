// this file is generated by script, don't modify it !!!
import { ContractBase } from '../../../shared/contract/contract_base.js'
import { fromWei } from '../../../shared/utils/convert.js'
import { deleteIndexedKey } from '../../../shared/utils/web3.js'
import { voteAbi } from '../abi/voteAbi.js'

export class Vote extends ContractBase {
  // init
  constructor(chainId, contractAddress, opts = {}) {
    super(chainId, contractAddress, voteAbi)
    this.config = opts.config || {}
    // for pool use
    this.useProvider = opts.useProvider || false
  }

  // query
  async admin() {
    const res = await this._call('admin', [])
    return deleteIndexedKey(res)
  }
  async deadline() {
    const res = await this._call('deadline', [])
    return deleteIndexedKey(res)
  }
  async getVotePowerOnArbitrum(account) {
    const res = await this._call('getVotePowerOnArbitrum', [account])
    return deleteIndexedKey(res)
  }
  async getVotePowerOnBNB(account) {
    const res = await this._call('getVotePowerOnBNB', [account])
    return deleteIndexedKey(res)
  }
  async getVotePowerOnEthereum(account) {
    const res = await this._call('getVotePowerOnEthereum', [account])
    return deleteIndexedKey(res)
  }
  async getVotePowersOnArbitrum(accounts) {
    const res = await this._call('getVotePowersOnArbitrum', [accounts])
    return res.map((r) => fromWei(r))
  }
  async getVotePowersOnBNB(accounts) {
    const res = await this._call('getVotePowersOnBNB', [accounts])
    return res.map((r) => fromWei(r))
  }
  async getVotePowersOnEthereum(accounts) {
    const res = await this._call('getVotePowersOnEthereum', [accounts])
    return res.map((r) => fromWei(r))
  }
  async getVoters() {
    const res = await this._call('getVoters', [])
    return deleteIndexedKey(res)
  }
  async getVotes(accounts) {
    const res = await this._call('getVotes', [accounts])
    return deleteIndexedKey(res)
  }
  async implementation() {
    const res = await this._call('implementation', [])
    return deleteIndexedKey(res)
  }
  async numOptions() {
    const res = await this._call('numOptions', [])
    return deleteIndexedKey(res)
  }
  async topic() {
    const res = await this._call('topic', [])
    return deleteIndexedKey(res)
  }
  async voters(uint256_1) {
    const res = await this._call('voters', [uint256_1])
    return deleteIndexedKey(res)
  }
  async votes(address_1) {
    const res = await this._call('votes', [address_1])
    return deleteIndexedKey(res)
  }

  // tx
  // async initializeVote(accountAddress, topic_, numOptions_, deadline_, opts={}) {
  //   return await this._transact('initializeVote', [topic_, numOptions_, deadline_], accountAddress, opts)
  // }
  // async setAdmin(accountAddress, newAdmin, opts={}) {
  //   return await this._transact('setAdmin', [newAdmin], accountAddress, opts)
  // }
  async vote(accountAddress, option, opts={}) {
    return await this._transact('vote', [option], accountAddress, opts)
  }

}