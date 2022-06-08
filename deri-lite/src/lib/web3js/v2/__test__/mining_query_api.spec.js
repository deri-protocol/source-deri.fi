import { DeriEnv } from '../../shared/config'
import { bg } from '../../shared/utils';
import {
  getPoolLiquidity,
  getLiquidityInfo,
  getPoolInfoApy,
} from '../api/mining_query_api'
import { TIMEOUT, POOL_V2_ADDRESS } from '../../shared/__test__/setup';

describe('Mining query api', () => {
  it('getPoolLiquidity()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '0', true]
    const output = {
      liquidity: 61000,
      symbol: '',
    };
    const res = await getPoolLiquidity(...input)
    expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(output.liquidity)
  }, TIMEOUT)
  it('getLiquidityInfo()', async() => {
    const input = ['137', '0x43b4dfb998b4D17705EEBfFCc0380c6b98699252', '0xFefC938c543751babc46cc1D662B982bd1636721', '1' ]
    const output = {
      maxRemovableShares: 10,
      poolLiquidity: 100,
      shares: 10,
      pnl: 1,
    };
    DeriEnv.set('prod')
    const res = await getLiquidityInfo(...input)
    expect(bg(res.poolLiquidity).toNumber()).toBeGreaterThanOrEqual(output.poolLiquidity)
    DeriEnv.set('dev')
  }, TIMEOUT)
  it('getPoolInfoApy()', async() => {
    //const input = ['97', POOL_ADDRESS, ACCOUNT_ADDRESS, '0', true]
    const input = ['56', '0x19c2655A0e1639B189FB0CF06e02DC0254419D92', '1' ]
    //const input = ['137', '0x43b4dfb998b4D17705EEBfFCc0380c6b98699252', '0xFefC938c543751babc46cc1D662B982bd1636721', '1' ]
    const output = {
      apy: '0.14',
      volume1h: '0',
      volume24h: '0',
      multiplier: '0.8',
    };
    DeriEnv.set('prod')
    const res = await getPoolInfoApy(...input)
    expect(res.multiplier).toEqual(output.multiplier)
    expect(bg(res.apy).toNumber()).toBeGreaterThanOrEqual(bg(output.apy).toNumber())
    DeriEnv.set('dev')
  }, TIMEOUT)
})