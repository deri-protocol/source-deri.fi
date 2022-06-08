import { catchTxApiError, bg } from '../../shared/utils';
import { isOrderValid } from '../../v2/calculation';
import { perpetualPoolLiteFactory } from '../factory.js';

export const unlock = async (chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress];
  return catchTxApiError(async (chainId, poolAddress, accountAddress) => {
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    // const { bToken: bTokenAddress } = getPoolConfig(
    //   poolAddress,
    //   '0',
    //   null,
    //   'v2_lite'
    // );
    // const bToken = bTokenFactory(chainId, bTokenAddress);
    return await perpetualPool.bToken.unlock(accountAddress, poolAddress);
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
      const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
      await perpetualPool.init()
      return await perpetualPool.addMargin(accountAddress, amount);
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
      const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
      await perpetualPool.init()
      return await perpetualPool.removeMargin(
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
      const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
      await perpetualPool.init()
      // const { pToken: pTokenAddress } = getPoolConfig(
      //   poolAddress,
      //   '0',
      //   '0',
      //   'v2_lite'
      // );
      // const pToken = pTokenLiteFactory(chainId, pTokenAddress);
      // const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
      const pToken = perpetualPool.pToken
      const parameterInfo = perpetualPool.parameters
      // const symbols = perpetualPool.symbols
      const symbolIds = perpetualPool.activeSymbolIds
      const [liquidity, margin] = await Promise.all([
        //perpetualPool.getParameters(),
        perpetualPool.getLiquidity(),
        pToken.getMargin(accountAddress),
        //pToken.getActiveSymbolIds(),
      ]);
      const { minInitialMarginRatio, minPoolMarginRatio } = parameterInfo;
      let promises = [];

      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(perpetualPool.getSymbol(symbolIds[i]));
      }
      const symbols = await Promise.all(promises);

      promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(pToken.getPosition(accountAddress, symbolIds[i]));
      }
      const positions = await Promise.all(promises);

      let marginHeld = symbols.reduce((acc, s, index) => {
        if (index === parseInt(symbolId)) {
          return acc.plus(
            bg(s.price)
              .times(s.multiplier)
              .times(positions[index].volume.plus(newVolume))
              .abs()
          );
        } else {
          return acc.plus(
            bg(s.price).times(s.multiplier).times(positions[index].volume).abs()
          );
        }
      }, bg(0));
      marginHeld = marginHeld.times(minInitialMarginRatio);

      let liquidityUsed = symbols.reduce((acc, s, index) => {
        if (index === parseInt(symbolId)) {
          return acc.plus(
            bg(s.tradersNetVolume)
              .plus(newVolume)
              .times(s.price)
              .times(s.multiplier)
              .abs()
          );
        } else {
          return acc.plus(
            bg(s.tradersNetVolume).times(s.price).times(s.multiplier).abs()
          );
        }
      }, bg(0));
      liquidityUsed = liquidityUsed.times(minPoolMarginRatio);

      const orderValidation = isOrderValid(
        margin,
        marginHeld,
        liquidity,
        liquidityUsed
      );
      if (orderValidation.success) {
        return await perpetualPool.trade(accountAddress, symbolId, newVolume);
      } else {
        throw new Error(orderValidation.error);
      }
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
      // const { pToken: pTokenAddress } = getPoolConfig(
      //   poolAddress,
      //   '0',
      //   '0',
      //   'v2_lite'
      // );

      const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
      await perpetualPool.init()
      //const pToken = pTokenLiteFactory(chainId, pTokenAddress);
      const pToken = perpetualPool.pToken
      const { volume } = await pToken.getPosition(accountAddress, symbolId);
      if (!volume.eq(0)) {
        const newVolume = volume.negated();
        return await perpetualPool.trade(accountAddress, symbolId, newVolume);
      } else {
        throw new Error('no position to close');
      }
    },
    args
  );
};
