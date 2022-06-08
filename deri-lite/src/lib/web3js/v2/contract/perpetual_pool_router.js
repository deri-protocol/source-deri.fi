import { ContractBase } from '../../shared/contract/contract_base'
import { naturalToDeri } from '../../shared/utils'
import { MAX_INT256 } from '../../shared/config';
import { perpetualPoolRouterAbi} from './abis';

export class PerpetualPoolRouter extends ContractBase {
  constructor(chainId, contractAddress) {
    super(chainId, contractAddress, perpetualPoolRouterAbi)
    this.poolAddress = ''
  }

  // === query ===
  async pool() {
    this.poolAddress = await this._call('pool');
    return this.poolAddress
  }

  // === transaction ===
  async addLiquidity(accountAddress, bTokenId, amount) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'addLiquidity',
      [bTokenId, naturalToDeri(amount)],
      accountAddress
    );
  }

  async removeLiquidity(accountAddress, bTokenId, amount, isMaximum) {
    if (isMaximum) {
      return await this._transact(
        'removeLiquidity',
        [bTokenId, MAX_INT256],
        accountAddress
      );
    } else {
      return await this._transact(
        'removeLiquidity',
        [bTokenId, naturalToDeri(amount)],
        accountAddress
      );
    }
  }

  async addMargin(accountAddress, bTokenId, amount) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'addMargin',
      [bTokenId, naturalToDeri(amount)],
      accountAddress
    );
  }

  async removeMargin(accountAddress, bTokenId, amount, isMaximum) {
    if (!this.poolAddress) {
      await this.pool()
    }
    if (isMaximum) {
      //console.log('->', MAX_INT256)
      return await this._transact(
        'removeMargin',
        [bTokenId, MAX_INT256],
        accountAddress
      );
    } else {
      return await this._transact(
        'removeMargin',
        [bTokenId, naturalToDeri(amount)],
        accountAddress
      );
    }
  }

  async trade(accountAddress, symbolId, amount) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'trade',
      [symbolId, naturalToDeri(amount)],
      accountAddress
    );
  }

  // with prices
  async addLiquidityWithPrices(accountAddress, bTokenId, amount, priceInfos) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'addLiquidityWithPrices',
      [bTokenId, naturalToDeri(amount), priceInfos],
      accountAddress
    );
  }
  async removeLiquidityWithPrices(accountAddress, bTokenId, amount, priceInfos, isMaximum) {
    if (isMaximum) {
      return await this._transact(
        'removeLiquidityWithPrices',
        [bTokenId, MAX_INT256, priceInfos],
        accountAddress
      );
    } else {
      return await this._transact(
        'removeLiquidityWithPrices',
        [bTokenId, naturalToDeri(amount), priceInfos],
        accountAddress
      );
    }
  }

  async addMarginWithPrices(accountAddress, bTokenId, amount, priceInfos) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'addMarginWithPrices',
      [bTokenId, naturalToDeri(amount), priceInfos],
      accountAddress
    );
  }

  async removeMarginWithPrices(accountAddress, bTokenId, amount, priceInfos, isMaximum) {
    if (!this.poolAddress) {
      await this.pool()
    }
    if (isMaximum) {
      return await this._transact(
        'removeMarginWithPrices',
        [bTokenId, MAX_INT256, priceInfos],
        accountAddress
      );
    } else {
      return await this._transact(
        'removeMarginWithPrices',
        [bTokenId, naturalToDeri(amount), priceInfos],
        accountAddress
      );
    }
  }

  async tradeWithPrices(accountAddress, symbolId, amount, priceInfos) {
    if (!this.poolAddress) {
      await this.pool()
    }
    return await this._transact(
      'tradeWithPrices',
      [symbolId, naturalToDeri(amount), priceInfos],
      accountAddress
    );
  }

  // async liquidate(acountAddress) {
  //   if (!this.poolAddress) {
  //     await this.pool()
  //   }
  //   return await this._transact(
  //     'liquidate',
  //     [accountAddress],
  //     accountAddress
  //   );
  // }

}