import { ContractBase } from "../contract_base";
import { symbolOracleOffChainAbi } from '../abis';
import { deriToNatural } from '../../utils';

export class SymbolOracleOffChain extends ContractBase {
  constructor(chainId, address) {
    super(chainId, address, symbolOracleOffChainAbi);
  }
  async getPrice() {
    const res = await this._call('getPrice', []);
    return deriToNatural(res);
  }
  async signer() {
    await this._init();
    const res = await this.contract.methods['signer']().call();
    return res;
  }
  async signatory() {
    await this._init();
    const res = await this.contract.methods['signatory']().call();
    return res;
  }
}