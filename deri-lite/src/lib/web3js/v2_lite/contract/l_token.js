import { ContractBase } from '../../shared/contract'
import { deriToNatural } from '../../shared/utils';
import { lTokenLiteAbi } from './abis';

export class LTokenLite extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, lTokenLiteAbi)
  }

  // === query ===
  async balanceOf(accountAddress) {
    const res = await this._call('balanceOf', [accountAddress]);
    return deriToNatural(res)
  }
  async totalSupply() {
    const res = await this._call('totalSupply');
    return deriToNatural(res);
  }
  async pool() {
    return await this._call('pool');
  }
}
