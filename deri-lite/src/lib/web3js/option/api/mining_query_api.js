import { getPoolConfig } from '../../shared/config';
import { catchApiError, bg } from '../../shared/utils';
import {
  calculateMaxRemovableShares,
  calculateShareValue,
} from '../../v1/calculation';
import { everlastingOptionFactory } from '../factory/pool';
import {
  lTokenOptionFactory,
} from '../factory/tokens';
import { volatilitiesCache } from '../utils';

const _getLiquidityInfo = async (chainId, poolAddress, accountAddress) => {
  const { lToken: lTokenAddress } = getPoolConfig(
    poolAddress,
    '0',
    '0',
    'option'
  );
  const optionPool = everlastingOptionFactory(chainId, poolAddress);
  await optionPool._updateConfig()
  const lToken = lTokenOptionFactory(chainId, lTokenAddress);
  const [
    lTokenBalance,
    lTokenTotalSupply,
  ] = await Promise.all([
    lToken.balanceOf(accountAddress),
    lToken.totalSupply(),
  ]);

  const symbols = optionPool.activeSymbols
  const symbolVolatilities = await volatilitiesCache.get(symbols.map((s) => s.symbol))
  const state = await optionPool.viewer.getPoolStates(poolAddress, [], symbolVolatilities.map((v) => v.volatility))
  const { poolState } = state;
  const { initialMarginRatio, liquidity, totalDynamicEquity } = poolState;
  const cost = symbols.reduce((acc, s) => acc.plus(s.tradersNetCost), bg(0));
  const value = symbols.reduce(
    (acc, s) =>
      acc.plus(bg(s.tradersNetVolume).times(s.strikePrice).times(s.multiplier)),
    bg(0)
  );
  return {
    totalSupply: lTokenTotalSupply.toString(),
    poolLiquidity: liquidity.toString(),
    shares: lTokenBalance.toString(),
    shareValue: calculateShareValue(
      lTokenTotalSupply,
      totalDynamicEquity
    ).toString(),
    maxRemovableShares: calculateMaxRemovableShares(
      lTokenBalance,
      lTokenTotalSupply,
      liquidity,
      value,
      cost,
      bg(initialMarginRatio).times(10)
    ).toString(),
  };
};

export const getLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress
) => {
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
};
