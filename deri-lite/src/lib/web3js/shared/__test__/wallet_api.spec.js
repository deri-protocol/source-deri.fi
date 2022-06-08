import { connectWallet, getUserWalletBalance, hasWallet } from "../api/wallet_api"
import { bg } from '../utils'
import { ACCOUNT_ADDRESS, CHAIN_ID, TIMEOUT } from "./setup"

describe('wallet api', () => {
  it('has wallet', async() => {
    const res = await hasWallet()
    // will return success = false in nodejs env
    expect(res.success).toEqual(false)
  }, TIMEOUT)
  it('connect wallet', async() => {
    const res = await connectWallet()
    // will return success = false in nodejs env
    expect(res.success).toEqual(false)
  }, TIMEOUT)
  it('getUserWalletBalance', async() => {
    const res = await getUserWalletBalance(CHAIN_ID, ACCOUNT_ADDRESS)
    // will return success = false in nodejs env
    const minOutput= 10
    const maxOutput = 80
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(minOutput)
    expect(bg(res).toNumber()).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
})