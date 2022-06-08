import { ContractBase } from '../../shared/contract/contract_base';
import { perpetualPoolLiteManagerAbi } from './abis.js'

export class PerpetualPoolLiteManager extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, perpetualPoolLiteManagerAbi)
  }

  // query
  async getNumPools() {
    const res = await this._call('getNumPools', [])
    return res
  }
  async poolTemplate() {
    const res = await this._call('poolTemplate', [])
    return res
  }
  async pools(poolId) {
    const res = await this._call('pools', [poolId])
    return res
  }
  async protocolFeeCollector() {
    const res = await this._call('protocolFeeCollector', [])
    return res
  }
  async protocolFeeCutRatio() {
    const res = await this._call('protocolFeeCutRatio', [])
    return res
  }

  // tx
  async createPool(accountAddress, parameters, bTokenAddress, pairedTokenAddress) {
    return await this._transact('createPool', [parameters, bTokenAddress, pairedTokenAddress], accountAddress)
  }

}