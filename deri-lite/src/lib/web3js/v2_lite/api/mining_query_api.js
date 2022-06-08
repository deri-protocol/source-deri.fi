import { catchApiError, bg, deriToNatural, getNetworkName } from '../../shared/utils';
import { databaseFactory } from '../../shared/factory';
import { calculateMaxRemovableShares, calculateShareValue } from '../../v1/calculation';
import { perpetualPoolLiteFactory } from '../factory';


const _getLiquidityInfo = async(chainId, poolAddress, accountAddress) => {
  //const { lToken:lTokenAddress, pToken:pTokenAddress} = getPoolConfig(poolAddress, '0', null, 'v2_lite')
  const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
  await perpetualPool.init()
  // const bTokenSymbol = perpetualPool.bTokenSymbol
  // const lToken = lTokenLiteFactory(chainId, lTokenAddress)
  // const pToken = pTokenLiteFactory(chainId, pTokenAddress)
  const lToken = perpetualPool.lToken
  // const pToken = perpetualPool.pToken
  const parameterInfo = perpetualPool.parameters
  const symbolIds = perpetualPool.activeSymbolIds
  //const symbolIndex = symbolIds.indexOf(symbolId)
  //const symbols = perpetualPool.symbols

  const [liquidity, lTokenBalance, lTokenTotalSupply] = await Promise.all([
    //perpetualPool.getParameters(),
    perpetualPool.getLiquidity(),
    lToken.balanceOf(accountAddress),
    lToken.totalSupply(),
    //pToken.getActiveSymbolIds(),
  ])
  const { minPoolMarginRatio } = parameterInfo;
  let promises = []
  for (let i = 0; i < symbolIds.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIds[i]));
  }
  const symbols = await Promise.all(promises)
  const totalPnl = symbols.reduce((acc, s) => {
    return acc.plus(s.tradersNetVolume.times(s.price).times(s.multiplier).minus(s.tradersNetCost))
  }, bg(0))
  const poolDynamicEquity = liquidity.minus(totalPnl)
  const cost = symbols.reduce((acc, s) => acc.plus(s.tradersNetCost), bg(0))
  const value = symbols.reduce((acc, s) => acc.plus(bg(s.tradersNetVolume).times(s.price).times(s.multiplier)), bg(0))
  return {
    totalSupply: lTokenTotalSupply.toString(),
    poolLiquidity: liquidity.toString(),
    shares: lTokenBalance.toString(),
    shareValue: calculateShareValue(
      lTokenTotalSupply,
      poolDynamicEquity
    ).toString(),
    maxRemovableShares: calculateMaxRemovableShares(
      lTokenBalance,
      lTokenTotalSupply,
      liquidity,
      value,
      cost,
      minPoolMarginRatio
    ).toString(),
  };
}
export const getLiquidityInfo = async(chainId, poolAddress, accountAddress) => {
  return catchApiError(
    _getLiquidityInfo,
    [chainId, poolAddress, accountAddress],
    'getLiquidityInfo',
    {
      totalSupply: '',
      poolLiquidity: '',
      shares: '',
      shareValue: '',
      maxRemovableShares: '',
    }
  );
}

export const getPoolLiquidity = async (chainId, poolAddress) => {
  // use the dev database
  const db = databaseFactory();
  try {
    const res = await db
      .getValues([`${chainId}.${poolAddress}.liquidity`])
      .catch((err) => console.log('getPoolLiquidity', err));
    if (res) {
      const [liquidity] = res;
      return {
        liquidity: deriToNatural(liquidity).toString(),
        symbol:'',
      };
    }
  } catch (err) {
    console.log(`${err}`)
  }
  return {
    liquidity: '',
    symbol:'',
  };
};

export const getPoolInfoApy = async (chainId, poolAddress) => {
  const db = databaseFactory(true);
  try {
    const poolNetwork = getNetworkName(chainId);
    const res = await db
      .getValues([
        `${poolNetwork}.${poolAddress}.apy`,
        `${poolNetwork}.${poolAddress}.volume.1h`,
        `${poolNetwork}.${poolAddress}.volume.24h`,
      ])
      .catch((err) => console.log('getPoolInfoApy', err));
    if (res) {
      const [apy, volume1h, volume24h] = res;
      return {
        apy: deriToNatural(apy).toString(),
        volume1h: deriToNatural(volume1h).toString(),
        volume24h: deriToNatural(volume24h).toString(),
      };
    }
  } catch (err) {
    console.log(`${err}`)
  }
};
