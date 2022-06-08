import { lTokenFactory } from '../factory'
import {
  TIMEOUT,
  POOL_V2_ADDRESS,
  ACCOUNT2_ADDRESS,
  ACCOUNT_ADDRESS,
  LTOKEN_V2_ADDRESS,
} from '../../shared/__test__/setup';

describe('LToken', () => {
  let lToken
  beforeAll(() => {
    lToken = lTokenFactory('97', LTOKEN_V2_ADDRESS)
  })
  test('balanceOf()', async() => {
    const output = '1'
    expect(await lToken.balanceOf(ACCOUNT_ADDRESS)).toEqual(output)
  }, TIMEOUT)
  test('pool()', async() => {
    expect(await lToken.pool()).toEqual(POOL_V2_ADDRESS)
  }, TIMEOUT)
  test('exists()', async() => {
    expect(await lToken.exists(ACCOUNT_ADDRESS)).toEqual(true)
    expect(await lToken.exists(ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT)
  test('getAsset()', async() => {
    const output =  {
      liquidity: 500,
      pnl:0,
      lastCumulativePnl: 0.1
    }
    const res = await lToken.getAsset(ACCOUNT_ADDRESS, 0)
    expect(res.liquidity.toNumber()).toBeGreaterThanOrEqual(output.liquidity)
    expect(res.pnl.toNumber()).toBeGreaterThanOrEqual(output.pnl)
    expect(res.lastCumulativePnl.toNumber()).toBeGreaterThanOrEqual(output.lastCumulativePnl)
  }, TIMEOUT)
  test('getAssets()', async() => {
    const output = 3
    const res = await lToken.getAssets(ACCOUNT_ADDRESS)
    expect(res.length).toEqual(output)
  }, TIMEOUT)
})