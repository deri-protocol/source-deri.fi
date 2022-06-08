import { getPoolConfig } from '../../shared/config';
import { bTokenFactory } from '../../shared/factory';
import { catchTxApiError, bg } from '../../shared/utils';
//import { isOrderValid } from '../../v2/calculation';
import { everlastingOptionFactory } from '../factory/pool.js';
import { pTokenOptionFactory} from '../factory/tokens';

export const unlock = async (chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress];
  return catchTxApiError(async (chainId, poolAddress, accountAddress) => {
    const { bToken: bTokenAddress } = getPoolConfig(
      poolAddress,
      '0',
      '0',
      'option'
    );
    const bToken = bTokenFactory(chainId, bTokenAddress);
    return await bToken.unlock(accountAddress, poolAddress);
  }, args);
};

export const depositMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  const args = [chainId, poolAddress, accountAddress, amount];
  return catchTxApiError(
    async (chainId, poolAddress, accountAddress, amount) => {
      const optionPool = everlastingOptionFactory(chainId, poolAddress);
      return await optionPool.addMargin(accountAddress, amount);
    },
    args
  );
};

export const withdrawMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  isMaximum = false
) => {
  const args = [chainId, poolAddress, accountAddress, amount, isMaximum];
  return catchTxApiError(
    async (chainId, poolAddress, accountAddress, amount, isMaximum) => {
      const optionPool = everlastingOptionFactory(chainId, poolAddress);
      return await optionPool.removeMargin(
        accountAddress,
        amount,
        isMaximum
      );
    },
    args
  );
};

export const tradeWithMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume,
  symbolId
) => {
  const args = [chainId, poolAddress, accountAddress, newVolume, symbolId];
  return catchTxApiError(
    async (chainId, poolAddress, accountAddress, newVolume, symbolId) => {
      // const { pToken: pTokenAddress } = getPoolConfig(
      //   poolAddress,
      //   '0',
      //   '0',
      //   'option'
      // );
      // const pToken = pTokenOptionFactory(chainId, pTokenAddress);
      const optionPool = everlastingOptionFactory(chainId, poolAddress);
      // const [parameterInfo, liquidity, margin, symbolIds] = await Promise.all([
      //   optionPool.getParameters(),
      //   optionPool.getLiquidity(),
      //   pToken.getMargin(accountAddress),
      //   pToken.getActiveSymbolIds(),
      // ]);
      // no minInitialMarginRatio in option
      // const { initialMarginRatio, minPoolMarginRatio } = parameterInfo;
      // let promises = [];

      // for (let i = 0; i < symbolIds.length; i++) {
      //   promises.push(optionPool.getSymbol(symbolIds[i]));
      // }
      // const symbols = await Promise.all(promises);

      // promises = [];
      // for (let i = 0; i < symbolIds.length; i++) {
      //   promises.push(pToken.getPosition(accountAddress, symbolIds[i]));
      // }
      // const positions = await Promise.all(promises);

      // let marginHeld = symbols.reduce((acc, s, index) => {
      //   if (index === parseInt(symbolId)) {
      //     return acc.plus(
      //       bg(s.price)
      //         .times(s.multiplier)
      //         .times(bg(positions[index]).volume.plus(newVolume))
      //         .abs()
      //     );
      //   } else {
      //     return acc.plus(
      //       bg(s.price).times(s.multiplier).times(positions[index].volume).abs()
      //     );
      //   }
      // }, bg(0));
      // marginHeld = marginHeld.times(initialMarginRatio);

      // let liquidityUsed = symbols.reduce((acc, s, index) => {
      //   if (index === parseInt(symbolId)) {
      //     return acc.plus(
      //       bg(s.tradersNetVolume)
      //         .plus(newVolume)
      //         .times(s.price)
      //         .times(s.multiplier)
      //         .abs()
      //     );
      //   } else {
      //     return acc.plus(
      //       bg(s.tradersNetVolume).times(s.price).times(s.multiplier).abs()
      //     );
      //   }
      // }, bg(0));
      // liquidityUsed = liquidityUsed.times(minPoolMarginRatio);

      // const orderValidation = isOrderValid(
      //   margin,
      //   marginHeld,
      //   liquidity,
      //   liquidityUsed
      // );
      // if (orderValidation.success) {
        return await optionPool.trade(accountAddress, symbolId, newVolume);
      // } else {
      //   throw new Error(orderValidation.error);
      // }
    },
    args
  );
};

export const closePosition = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  const args = [chainId, poolAddress, accountAddress, symbolId];
  return catchTxApiError(
    async (chainId, poolAddress, accountAddress, symbolId) => {
      const { pToken: pTokenAddress } = getPoolConfig(
        poolAddress,
        '0',
        '0',
        'option'
      );
      const optionPool = everlastingOptionFactory(chainId, poolAddress);
      const pToken = pTokenOptionFactory(chainId, pTokenAddress);
      const { volume } = await pToken.getPosition(accountAddress, symbolId);
      if (!bg(volume).eq(0)) {
        const newVolume = bg(volume).negated().toString();
        return await optionPool.trade(accountAddress, symbolId, newVolume);
      } else {
        throw new Error('no position to close');
      }
    },
    args
  );
};
