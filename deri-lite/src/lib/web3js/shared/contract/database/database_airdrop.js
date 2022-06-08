//import { DatabaseBaseContract } from './database_base'
import { ContractBase } from '../contract_base';

/* eslint-disable */
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"newController","type":"address"}],"name":"addController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"controllers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"data","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"oldController","type":"address"}],"name":"delController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string[]","name":"keys","type":"string[]"}],"name":"getValues","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"bytes32","name":"value","type":"bytes32"}],"internalType":"structDatabase.Params1[]","name":"pairs","type":"tuple[]"}],"name":"setValues","outputs":[],"stateMutability":"nonpayable","type":"function"}]
/* eslint-enable */

export class DatabaseAirdropContract extends ContractBase {
  constructor(contractAddress) {
    super('97', contractAddress, CONTRACT_ABI)
  }
  async getValues(keyArray) {
    return await this._call('getValues', [keyArray])
  }
}
