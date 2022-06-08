import { getPriceInfo } from '../../shared/utils/oracle';
import {
  getPoolBTokenIdList,
  getPoolConfig2,
  getPoolSymbolIdList,
} from '../../shared/config';
import {
  perpetualPoolRouterFactory,
  perpetualPoolFactory,
  lTokenFactory,
} from '../factory';
import { isBToken0RatioValid, isPoolMarginRatioValid } from '../calculation';

export const addLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId
) => {
  const { router: routerAddress } = getPoolConfig2(poolAddress);
  const perpetualPoolRouter = perpetualPoolRouterFactory(
    chainId,
    routerAddress
  );
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const bTokenIdList = getPoolBTokenIdList(poolAddress);
  let promises = [];
  for (let i = 0; i < bTokenIdList.length; i++) {
    promises.push(perpetualPool.getBToken(bTokenIdList[i]));
  }
  const bTokens = await Promise.all(promises);
  const { minBToken0Ratio } = await perpetualPool.getParameters();
  const validation = isBToken0RatioValid(
    bTokens,
    bTokenId,
    amount,
    minBToken0Ratio
  );
  let res;
  if (validation.success) {
    try {
      const tx = await perpetualPoolRouter.addLiquidity(
        accountAddress,
        bTokenId,
        amount
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: validation.error };
  }
  return res;
};

export const removeLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId,
  isMaximum = false
) => {
  const { router: routerAddress, lToken: lTokenAddress } = getPoolConfig2(
    poolAddress
  );
  const perpetualPoolRouter = perpetualPoolRouterFactory(
    chainId,
    routerAddress
  );
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const lToken = lTokenFactory(chainId, lTokenAddress);
  const lTokenAsset = await lToken.getAsset(accountAddress, bTokenId);
  const { liquidity: userLiquidity } = lTokenAsset;
  const bTokenIdList = getPoolBTokenIdList(poolAddress);
  let symbolIdList = getPoolSymbolIdList(poolAddress);
  let promises = [];
  for (let i = 0; i < bTokenIdList.length; i++) {
    promises.push(perpetualPool.getBToken(bTokenIdList[i]));
  }
  const bTokens = await Promise.all(promises);
  promises = [];
  for (let i = 0; i < symbolIdList.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIdList[i]));
  }
  const symbols = await Promise.all(promises);
  const { minPoolMarginRatio } = await perpetualPool.getParameters();
  const validation = isPoolMarginRatioValid(
    bTokens,
    bTokenId,
    amount,
    userLiquidity,
    symbols,
    minPoolMarginRatio
  );
  let res;
  if (validation.success) {
    try {
      const tx = await perpetualPoolRouter.removeLiquidity(
        accountAddress,
        bTokenId,
        amount,
        isMaximum
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: validation.error };
  }
  return res;
};

export const addLiquidityWithPrices = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId
) => {
  const { router: routerAddress } = getPoolConfig2(poolAddress);
  const symbolIdList = getPoolSymbolIdList(poolAddress);
  const bTokenIdList = getPoolBTokenIdList(poolAddress);
  const perpetualPoolRouter = perpetualPoolRouterFactory(
    chainId,
    routerAddress
  );
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  let promises = [];
  for (let i = 0; i < bTokenIdList.length; i++) {
    promises.push(perpetualPool.getBToken(bTokenIdList[i]));
  }
  const bTokens = await Promise.all(promises);
  const { minBToken0Ratio } = await perpetualPool.getParameters();
  const validation = isBToken0RatioValid(
    bTokens,
    bTokenId,
    amount,
    minBToken0Ratio
  );
  let res;
  if (validation.success) {
    try {
      const promises = symbolIdList.map(async (s) => {
        return await getPriceInfo(s);
      });
      const prices = await Promise.all(promises);
      const priceInfos = prices.map((p, index) => {
        return [
          symbolIdList[index],
          p.timestamp,
          p.price,
          parseInt(p.v).toString(),
          p.r,
          p.s,
        ];
      });
      const tx = await perpetualPoolRouter.addLiquidityWithPrices(
        accountAddress,
        bTokenId,
        amount,
        priceInfos
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: validation.error };
  }
  return res;
};

export const removeLiquidityWithPrices = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId,
  isMaximum = false
) => {
  const { router: routerAddress, lToken: lTokenAddress } = getPoolConfig2(
    poolAddress
  );
  const perpetualPoolRouter = perpetualPoolRouterFactory(
    chainId,
    routerAddress
  );
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);

  const lToken = lTokenFactory(chainId, lTokenAddress);
  const lTokenAsset = await lToken.getAsset(accountAddress, bTokenId);
  const { liquidity: userLiquidity } = lTokenAsset;
  const bTokenIdList = getPoolBTokenIdList(poolAddress);
  let promises = [];
  for (let i = 0; i < bTokenIdList.length; i++) {
    promises.push(perpetualPool.getBToken(bTokenIdList[i]));
  }
  const bTokens = await Promise.all(promises);
  promises = [];

  const symbolIdList = getPoolSymbolIdList(poolAddress);
  for (let i = 0; i < symbolIdList.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIdList[i]));
  }
  const symbols = await Promise.all(promises);
  const { minPoolMarginRatio } = await perpetualPool.getParameters();

  const validation = isPoolMarginRatioValid(
    bTokens,
    bTokenId,
    amount,
    userLiquidity,
    symbols,
    minPoolMarginRatio
  );
  let res;
  if (validation.success) {
    try {
      promises = symbolIdList.map(async (s) => {
        return await getPriceInfo(s);
      });
      const prices = await Promise.all(promises);
      const priceInfos = prices.map((p, index) => {
        return [
          symbolIdList[index],
          p.timestamp,
          p.price,
          parseInt(p.v).toString(),
          p.r,
          p.s,
        ];
      });
      const tx = await perpetualPoolRouter.removeLiquidityWithPrices(
        accountAddress,
        bTokenId,
        amount,
        priceInfos,
        isMaximum
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: validation.error };
  }
  return res;
};
