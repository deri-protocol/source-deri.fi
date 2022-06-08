import { ContractBase } from '../../shared';
import { perpetualPoolLiteViewerAbi } from './abis';

export class PerpetualPoolLiteViewer extends ContractBase {
  constructor(chainId, poolAddress) {
    super(chainId, poolAddress, perpetualPoolLiteViewerAbi);
  }
  async getOffChainOracleSymbols(poolAddress) {
    const res = await this._call('getOffChainOracleSymbols', [poolAddress]);
    //return res.filter((s) => s && s !== '');
    return res
  }
}
