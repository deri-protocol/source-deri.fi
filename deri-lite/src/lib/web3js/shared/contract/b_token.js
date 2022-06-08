import { deriToNatural, bg } from '../utils'
import { MAX_UINT256} from '../config'
import { ContractBase } from './contract_base'
import { bTokenAbi } from './abis';


export class BToken extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, bTokenAbi);
  }
  // === query ===
  async symbol() {
    return await this._call('symbol');
  }

  async decimals() {
    return await this._call('decimals');
  }
  async _balanceOf(address) {
    return await this._call('balanceOf', [address]);
  }

  async balanceOf(address) {
    const [res, decimals] = await Promise.all([
      this._balanceOf(address),
      this.decimals(),
    ]);
    return bg(res, -decimals);
  }

  async totalSupply() {
    const res = await this._call('totalSupply');
    return deriToNatural(res);
  }

  async isUnlocked(accountAddress, poolAddress) {
    const allowance = await this._call('allowance', [
      accountAddress,
      poolAddress,
    ]);
    return bg(allowance).gt(0);
  }

  // === transaction ===
  async unlock(accountAddress, poolAddress) {
    return await this._transact(
      'approve',
      [poolAddress, MAX_UINT256],
      accountAddress
    );
  }
}