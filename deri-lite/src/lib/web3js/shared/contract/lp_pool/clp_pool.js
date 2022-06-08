import { deriToNatural, naturalToDeri } from '../../utils';
import { ContractBase } from '../contract_base';

/* eslint-disable */
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"mintAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"AddLiquidity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"migrationTimestamp","type":"uint256"},{"indexed":false,"internalType":"address","name":"source","type":"address"},{"indexed":false,"internalType":"address","name":"target","type":"address"}],"name":"ExecuteMigration","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"migrationTimestamp","type":"uint256"},{"indexed":false,"internalType":"address","name":"source","type":"address"},{"indexed":false,"internalType":"address","name":"target","type":"address"}],"name":"PrepareMigration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"lAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"removeAmount","type":"uint256"}],"name":"RemoveLiquidity","type":"event"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"approveMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"controller","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"source","type":"address"}],"name":"executeMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAddresses","outputs":[{"internalType":"address","name":"bToken","type":"address"},{"internalType":"address","name":"lToken","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getParameters","outputs":[{"internalType":"uint256","name":"minAddLiquidity","type":"uint256"},{"internalType":"uint256","name":"redemptionFeeRatio","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getStateValues","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"address[2]","name":"addresses_","type":"address[2]"},{"internalType":"uint256[2]","name":"parameters_","type":"uint256[2]"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"migrationDestination","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"migrationTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newPool","type":"address"},{"internalType":"uint256","name":"graceDays","type":"uint256"}],"name":"prepareMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"lAmount","type":"uint256"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newController","type":"address"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
/* eslint-enable */

export class ClpPool extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, CONTRACT_ABI);
  }
  async addLiquidity(accountAddress, amount) {
    const args = [naturalToDeri(amount)];
    return await this._transact('addLiquidity', args, accountAddress);
  }

  async removeLiquidity(accountAddress, amount) {
    const args = [naturalToDeri(amount)];
    return await this._transact('removeLiquidity', args, accountAddress);
  }

  async getParameters() {
    const res = await this._call('getParameters');
    return {
      minAddLiquidity: deriToNatural(res.minAddLiquidity),
      redemptionFeeRatio: deriToNatural(res.redemptionFeeRatio),
    };
  }

  async getStateValues() {
    const res = await this._call('getStateValues');
    return {
      liquidity: deriToNatural(res),
    };
  }

  async getLiquidity() {
    const res = await this._call('getStateValues');
    if (res && res.liquidity) {
      return deriToNatural(res.liquidity);
    }
    throw new Error(
      `unable to get liquidity of this clp pool ${this.poolAddress}`
    );
  }
}
