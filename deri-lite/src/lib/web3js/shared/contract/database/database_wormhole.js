//import { DatabaseBaseContract } from './database_base'
import { ContractBase } from '../contract_base';

/* eslint-disable */
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"newController","type":"address"}],"name":"addController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"controllers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"oldController","type":"address"}],"name":"delController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"fromChainId","type":"uint256"},{"internalType":"address","name":"fromWormhole","type":"address"},{"internalType":"uint256","name":"toChainId","type":"uint256"},{"internalType":"address","name":"toWormhole","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"internalType":"structDatabase.Params1[]","name":"values","type":"tuple[]"}],"name":"setSignature","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"signature","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"fromChainId","type":"uint256"},{"internalType":"address","name":"fromWormhole","type":"address"},{"internalType":"uint256","name":"toChainId","type":"uint256"},{"internalType":"address","name":"toWormhole","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"bool","name":"valid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"values","type":"address[]"}],"name":"unsetSignature","outputs":[],"stateMutability":"nonpayable","type":"function"}]
/* eslint-enable */

export class DatabaseWormholeContract extends ContractBase {
  constructor(contractAddress) {
    super('97', contractAddress, CONTRACT_ABI);
  }

  async signature(accountAddress) {
    return await this._call('signature', [accountAddress])
  }
}
