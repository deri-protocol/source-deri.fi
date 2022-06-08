import {
  getPoolConfig2,
  getPoolBTokenIdList,
  getPoolSymbolIdList,
} from '../../shared/config';
import { databaseFactory } from '../../shared/factory';
import { bg, deriToNatural, getNetworkName } from '../../shared/utils';
import { lTokenFactory, perpetualPoolFactory } from '../factory';
import { calculateMaxRemovableLiquidity } from '../calculation';

export const getLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId
) => {
  try {
    const { lToken: lTokenAddress } = getPoolConfig2(poolAddress, bTokenId);
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const lToken = lTokenFactory(chainId, lTokenAddress);

    const bTokenIdList = getPoolBTokenIdList(poolAddress);
    const symbolIdList = getPoolSymbolIdList(poolAddress);

    const [parameterInfo, bTokenInfo, lTokenAsset] = await Promise.all([
      perpetualPool.getParameters(),
      perpetualPool.getBToken(bTokenId),
      lToken.getAsset(accountAddress, bTokenId),
    ]);
    const { minPoolMarginRatio } = parameterInfo;
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

    const cost = symbols.reduce((accum, s) => {
      return accum.plus(
        bg(s.tradersNetVolume).times(s.price).times(s.multiplier).abs()
      );
    }, bg(0));
    const totalPnl = symbols.reduce((accum, s) => {
      return accum.plus(
        bg(s.tradersNetVolume)
          .times(s.price)
          .times(s.multiplier)
          .minus(s.tradersNetCost)
      );
    }, bg(0));
    const restLiquidity = bTokens.reduce((accum, b, index) => {
      if (index === parseInt(bTokenId)) {
        return accum.plus(b.pnl);
      } else {
        return accum.plus(
          bg(b.liquidity).times(b.price).times(b.discount).plus(b.pnl)
        );
      }
    }, bg(0));

    const { liquidity: poolLiquidity } = bTokenInfo;
    const { liquidity, pnl, lastCumulativePnl } = lTokenAsset;
    const maxRemovableShares = calculateMaxRemovableLiquidity(
      bTokens[bTokenId],
      liquidity,
      cost,
      totalPnl,
      restLiquidity,
      minPoolMarginRatio
    );
    const approximatePnl = pnl.plus(
      bg(bTokens[bTokenId].cumulativePnl)
        .minus(lastCumulativePnl)
        .times(liquidity)
    );
    return {
      //totalSupply: lTokenTotalSupply.toString(),
      poolLiquidity: poolLiquidity.toString(),
      // shares: liquidity.toString(),
      // shareValue: '1',
      // maxRemovableShares: liquidity.toString()
      shares: liquidity.toString(),
      pnl: approximatePnl.div(bTokens[bTokenId].price).toString(),
      maxRemovableShares: maxRemovableShares.toString(),
    };
  } catch (err) {
    console.log(`${err}`);
  }
  return {
    poolLiquidity: '',
    shares: '',
    pnl: '',
    maxRemovableShares: '',
  };
};

export const getPoolLiquidity = async (chainId, poolAddress, bTokenId) => {
  // use the dev database
  const db = databaseFactory();
  try {
    const res = await db
      .getValues([`${chainId}.${poolAddress}.liquidity${bTokenId}`])
      .catch((err) => console.log('getPoolLiquidity', err));
    if (res) {
      const [liquidity] = res;
      return {
        liquidity: deriToNatural(liquidity).toString(),
        symbol: '',
      };
    }
  } catch (err) {
    console.log(`${err}`);
  }
  return {
    liquidity: '',
    symbol: '',
  };
};

export const getPoolInfoApy = async (chainId, poolAddress, bTokenId) => {
  const db = databaseFactory(true);
  try {
    const poolNetwork = getNetworkName(chainId);
    const res = await db
      .getValues([
        `${poolNetwork}.${poolAddress}.apy${bTokenId}`,
        `${poolNetwork}.${poolAddress}.volume.1h`,
        `${poolNetwork}.${poolAddress}.volume.24h`,
        `${poolNetwork}.${poolAddress}.V2.multiplier${bTokenId}`,
      ])
      .catch((err) => console.log('getPoolInfoApy', err));
    if (res) {
      const [apy, volume1h, volume24h, multiplier] = res;
      return {
        apy: deriToNatural(apy).toString(),
        volume1h: deriToNatural(volume1h).toString(),
        volume24h: deriToNatural(volume24h).toString(),
        multiplier: deriToNatural(multiplier).toString(),
      };
    }
  } catch (err) {
    console.log(`${err}`);
  }
};
