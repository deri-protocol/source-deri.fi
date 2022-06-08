import { pTokenFactory } from '../factory'
import {
  TIMEOUT,
  ACCOUNT2_ADDRESS,
  ACCOUNT_ADDRESS,
  POOL_V2_ADDRESS,
  PTOKEN_V2_ADDRESS,
} from '../../shared/__test__/setup';

describe('PToken', () => {
  let pToken
  beforeAll(() => {
    pToken =  pTokenFactory('97', PTOKEN_V2_ADDRESS)
  })
  test('pool()', async() => {
    const output = POOL_V2_ADDRESS
    expect(await pToken.pool()).toEqual(output)
  }, TIMEOUT)
  test('exists()', async() => {
    expect(await pToken.exists(ACCOUNT_ADDRESS)).toEqual(true)
    expect(await pToken.exists(ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT)
  test('balanceOf()', async() => {
    const output = '1'
    expect(await pToken.balanceOf(ACCOUNT_ADDRESS)).toEqual(output)
  }, TIMEOUT)
  test('getMargin()', async() => {
    const output =  109
    expect((await pToken.getMargin(ACCOUNT_ADDRESS, 0)).toNumber()).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)
  test('getMargins()', async() => {
    const output = 3
    const res = await pToken.getMargins(ACCOUNT_ADDRESS)
    expect(res.length).toEqual(output)
  }, TIMEOUT)
  test('getPosition()', async() => {
    const output =  {
      volume: 23,
      cost: 83.6736435,
      lastCumulativeFundingRate: 0.3,
    }
    const res = await pToken.getPosition(ACCOUNT_ADDRESS, 0)
    expect(res.volume.toNumber()).toBeGreaterThanOrEqual(output.volume)
    expect(res.cost.toNumber()).toBeGreaterThanOrEqual(output.cost)
    expect(res.lastCumulativeFundingRate.toNumber()).toBeLessThanOrEqual(output.lastCumulativeFundingRate)
  }, TIMEOUT)
  test('getPositions()', async() => {
    const output = 2
    const res = await pToken.getPositions(ACCOUNT_ADDRESS)
    expect(res.length).toEqual(output)
  }, TIMEOUT)
})