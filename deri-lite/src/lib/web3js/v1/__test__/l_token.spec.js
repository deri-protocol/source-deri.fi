import { bg } from "../../shared/utils"
import { lTokenFactory } from "../factory"
import { TIMEOUT, ACCOUNT_ADDRESS, chainId, lTokenAddress } from './setup';

describe('lToken', () => {
  let lToken
  beforeAll(() => {
    lToken = lTokenFactory(chainId, lTokenAddress)
  })
  test('totalSupply', async() => {
    const minOutput = 100
    const maxOutput = 100000
    const res = await lToken.totalSupply()
    expect(bg(res).toNumber()).toBeGreaterThan(minOutput)
    expect(bg(res).toNumber()).toBeLessThan(maxOutput)
  }, TIMEOUT)
  test('balanceOf', async() => {
    const minOutput = 10
    const maxOutput = 100000
    const res = await lToken.balanceOf(ACCOUNT_ADDRESS)
    expect(bg(res).toNumber()).toBeGreaterThan(minOutput)
    expect(bg(res).toNumber()).toBeLessThan(maxOutput)
  }, TIMEOUT)
})