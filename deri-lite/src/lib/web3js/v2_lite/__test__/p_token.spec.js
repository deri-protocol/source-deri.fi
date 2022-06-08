import { pTokenLiteFactory } from '../factory';
import {
  CHAIN_ID,
  PTOKEN_V2L_ADDRESS,
  POOL_V2L_ADDRESS,
  ACCOUNT_ADDRESS,
  ACCOUNT2_ADDRESS,
  TIMEOUT,
} from '../../shared/__test__/setup';
import { bg } from '../../shared/utils';

describe('pToken v2 lite', () => {
  let pToken
  beforeAll(() => {
    pToken = pTokenLiteFactory(CHAIN_ID, PTOKEN_V2L_ADDRESS)
  })
  it('pool()', async() => {
    expect(await pToken.pool()).toEqual(POOL_V2L_ADDRESS)
  }, TIMEOUT)
  it('balanceOf()', async() => {
    expect(await pToken.balanceOf(ACCOUNT_ADDRESS)).toEqual('1')
    expect(await pToken.balanceOf(ACCOUNT2_ADDRESS)).toEqual('0')
  }, TIMEOUT)
  it('exists()', async() => {
    expect(await pToken.exists(ACCOUNT_ADDRESS)).toEqual(true)
    expect(await pToken.exists(ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT)
  it('getMargin()', async() => {
    const output = 10
    expect((bg(await pToken.getMargin(ACCOUNT_ADDRESS))).toNumber()).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)
  it('getPosition()', async() => {
    const res = await pToken.getPosition(ACCOUNT_ADDRESS, '1')
    expect(res).toHaveProperty('volume')
    expect(res).toHaveProperty('cost')
    expect(res).toHaveProperty('lastCumulativeFundingRate')
    expect(bg(res.volume).toNumber()).toBeGreaterThanOrEqual(0)
    expect(bg(res.cost).toNumber()).toBeGreaterThanOrEqual(0)
  }, TIMEOUT)
  it('getActiveSymbolIds', async() => {
    expect(await pToken.getActiveSymbolIds()).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);
  }, TIMEOUT)
  it('isActiveSymbolId', async() => {
    expect(await pToken.isActiveSymbolId('0')).toEqual(true)
    expect(await pToken.isActiveSymbolId('11')).toEqual(false)
  }, TIMEOUT)
})
