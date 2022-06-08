import { deriFactory } from "../factory/contract"
import { ACCOUNT_ADDRESS, POOL_V2L_ADDRESS, TIMEOUT } from "./setup"
import { bg } from '../utils'

describe('deri', () => {
  let deri
  beforeAll(() => {
    deri = deriFactory('56', '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5')
  })
  test('decimals', async() => {
    expect(await deri.decimals()).toEqual('18')
  }, TIMEOUT)
  test('isUnlocked', async() => {
    expect(await deri.isUnlocked(ACCOUNT_ADDRESS, POOL_V2L_ADDRESS)).toEqual(false)
  }, TIMEOUT)
  test('balanceof', async() => {
    const res = await deri.balanceOf(ACCOUNT_ADDRESS)
    expect(bg(res).toNumber()).toBeGreaterThan(0)
  }, TIMEOUT)
})