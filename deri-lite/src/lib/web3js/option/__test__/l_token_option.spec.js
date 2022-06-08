import { CHAIN_ID, OPTION_POOL_ADDRESS, OPTION_LTOKEN_ADDRESS, TIMEOUT, MIN_NUMBER, MAX_NUMBER, MID_NUMBER, ACCOUNT_ADDRESS } from "../../shared/__test__/setup"
import { bg } from '../../shared';
import { lTokenOptionFactory } from "../factory";

describe('LTokenOption', () => {
  let lTokenOption
  beforeAll(() => {
    lTokenOption = lTokenOptionFactory(CHAIN_ID, OPTION_LTOKEN_ADDRESS)
  })
  it('name', async() => {
    expect(await lTokenOption.name()).toEqual('Deri Option Liquidity Token')
  }, TIMEOUT)
  it('pool', async() => {
    expect(await lTokenOption.pool()).toEqual(OPTION_POOL_ADDRESS)
  }, TIMEOUT)
  it('symbol', async() => {
    expect(await lTokenOption.symbol()).toEqual('DOLT')
  }, TIMEOUT)
  it('totalSupply', async() => {
    const res = await lTokenOption.totalSupply()
    expect(bg(res).toNumber()).toBeGreaterThan(MID_NUMBER)
    expect(bg(res).toNumber()).toBeLessThan(MAX_NUMBER)
  }, TIMEOUT)
  it('balanceOf', async() => {
    const res = await lTokenOption.balanceOf(ACCOUNT_ADDRESS)
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(MIN_NUMBER)
    expect(bg(res).toNumber()).toBeLessThan(MAX_NUMBER)
  }, TIMEOUT)
})