import { getLpLiquidityInfo, isLpUnlocked, getLpWalletBalance } from "../api/lp_pool_query_api"
import { DeriEnv } from "../config"
import { bg } from "../utils"
import { ACCOUNT2_ADDRESS, TIMEOUT} from './setup'

const chainId = '56'
const slpAddress = '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd'
const clpAddress = '0x4de2Ac273aD1BBe2F5C41f986d7b3cef8383Df98'
const clp2Address = '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
const accountAddress = '0x2bAa211D7E62593bA379dF362F23e7B813d760Ad'

describe('lp pool query api', () => {
  it('getLpLiquidityInfo slp', async() => {
    DeriEnv.set('prod')
    const res = await getLpLiquidityInfo(1, slpAddress, accountAddress)
    DeriEnv.set('dev')
    const minOutput = 1.5
    const maxOutput = 1.9
    expect(bg(res.poolLiquidity).toNumber()).toBeGreaterThanOrEqual(minOutput)
    expect(bg(res.poolLiquidity).toNumber()).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
  it('getLpLiquidityInfo clp', async() => {
    DeriEnv.set('prod')
    const res = await getLpLiquidityInfo(chainId, clpAddress, accountAddress)
    DeriEnv.set('dev')
    const minOutput = 20000 
    const maxOutput = 20300 
    expect(bg(res.poolLiquidity).toNumber()).toBeGreaterThanOrEqual(minOutput)
    expect(bg(res.poolLiquidity).toNumber()).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
  it('getLpLiquidityInfo clp2', async() => {
    DeriEnv.set('prod')
    const res = await getLpLiquidityInfo(56, clp2Address, accountAddress)
    DeriEnv.set('dev')
    const minOutput = 20000 
    const maxOutput = 45000000
    expect(bg(res.poolLiquidity).toNumber()).toBeGreaterThanOrEqual(minOutput)
    expect(bg(res.poolLiquidity).toNumber()).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
  it('isLpUnlocked slp', async() => {
    DeriEnv.set('prod')
    const res = await isLpUnlocked(1, slpAddress, accountAddress)
    const res2 = await isLpUnlocked(1, slpAddress, ACCOUNT2_ADDRESS)
    DeriEnv.set('dev')
    expect(res).toEqual(true)
    expect(res2).toEqual(false)
  }, TIMEOUT)
  it('isLpUnlocked clp', async() => {
    DeriEnv.set('prod')
    const res = await isLpUnlocked(56, clpAddress, accountAddress)
    const res2 = await isLpUnlocked(56, clpAddress, ACCOUNT2_ADDRESS)
    DeriEnv.set('dev')
    expect(res).toEqual(true)
    expect(res2).toEqual(false)
  }, TIMEOUT)
  it('isLpUnlocked clp2', async() => {
    DeriEnv.set('prod')
    const res = await isLpUnlocked(chainId, clp2Address, accountAddress)
    const res2 = await isLpUnlocked(chainId, clp2Address, ACCOUNT2_ADDRESS)
    DeriEnv.set('dev')
    expect(res).toEqual(true)
    expect(res2).toEqual(false)
  }, TIMEOUT)
  it('isLpWalletBalance slp', async() => {
    DeriEnv.set('prod')
    const res = await getLpWalletBalance(1, slpAddress, accountAddress)
    DeriEnv.set('dev')
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(0)
  }, TIMEOUT)
  it('isLpWalletBalance clp', async() => {
    DeriEnv.set('prod')
    const res = await getLpWalletBalance(56, clpAddress, accountAddress)
    DeriEnv.set('dev')
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(0)
  }, TIMEOUT)
  it('isLpWalletBalance clp2', async() => {
    DeriEnv.set('prod')
    const res = await getLpWalletBalance(56, clp2Address, accountAddress)
    DeriEnv.set('dev')
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(0)
  }, TIMEOUT)
})