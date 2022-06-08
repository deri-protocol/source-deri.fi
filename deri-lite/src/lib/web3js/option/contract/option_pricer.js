import { ContractBase, fromWei } from '../../shared'

export const optionPricerAbi = [ { "inputs": [ { "internalType": "int256", "name": "S", "type": "int256" }, { "internalType": "int256", "name": "K", "type": "int256" }, { "internalType": "int256", "name": "V", "type": "int256" }, { "internalType": "int256", "name": "T", "type": "int256" } ], "name": "getEverlastingTimeValue", "outputs": [ { "internalType": "int256", "name": "timeValue", "type": "int256" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "int256", "name": "S", "type": "int256" }, { "internalType": "int256", "name": "K", "type": "int256" }, { "internalType": "int256", "name": "V", "type": "int256" }, { "internalType": "int256", "name": "T", "type": "int256" } ], "name": "getEverlastingTimeValueAndDelta", "outputs": [ { "internalType": "int256", "name": "timeValue", "type": "int256" }, { "internalType": "int256", "name": "delta", "type": "int256" } ], "stateMutability": "pure", "type": "function" } ]

export class OptionPricer extends ContractBase {
  // init
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, optionPricerAbi)
  }

  async getEverlastingTimeValueAndDelta(S, K, V, T) {
    const res = await this._call('getEverlastingTimeValueAndDelta', [S, K, V, T])
    return {
      timeValue: fromWei(res.timeValue),
      delta: fromWei(res.delta),
    };
  }
}