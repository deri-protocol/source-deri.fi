import { getLiquidityInfo } from "../api/mining_query_api"
import { ACCOUNT_ADDRESS, CHAIN_ID, POOL_V2L_ADDRESS, TIMEOUT } from "../../shared/__test__/setup"
import { bg } from '../../shared/utils'

describe('mining_query_api', () => {
  it('getLiquidityInfo', async() => {
    const res = await getLiquidityInfo(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT_ADDRESS)
    expect(res).toHaveProperty('totalSupply')
    expect(res).toHaveProperty('poolLiquidity')
    expect(res).toHaveProperty('shares')
    expect(res).toHaveProperty('shareValue')
    expect(res).toHaveProperty('maxRemovableShares')
    expect(bg(res.totalSupply).toNumber()).toBeGreaterThan(10000)
    expect(bg(res.poolLiquidity).toNumber()).toBeGreaterThan(10000)
    expect(bg(res.shares).toNumber()).toBeGreaterThanOrEqual(0)
    expect(bg(res.shareValue).toNumber()).toBeGreaterThanOrEqual(0.4)
    expect(bg(res.maxRemovableShares).toNumber()).toBeGreaterThanOrEqual(0)
  }, TIMEOUT)
})