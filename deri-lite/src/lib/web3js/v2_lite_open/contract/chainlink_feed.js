import { ContractBase } from '../../shared/contract/contract_base';
import { chainlinkFeedAbi } from './abis';

export class ChainlinkFeed extends ContractBase {
  constructor(chainId, poolAddress) {
    super(chainId, poolAddress, chainlinkFeedAbi);
  }
  async symbol() {
    const res = await this._call('description');
    return res.split('/').map((s) => s.trim()).join('')
  }
}
