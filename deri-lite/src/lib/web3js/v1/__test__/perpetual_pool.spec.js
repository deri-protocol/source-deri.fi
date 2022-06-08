import { bg } from "../../shared/utils"
import { perpetualPoolFactory } from "../factory"
import { chainId, poolAddress, TIMEOUT } from "./setup"

describe('perpetual pool', () => {
  let pool
  beforeAll(() => {
    pool = perpetualPoolFactory(chainId, poolAddress)
  })
  test('symbol', async() => {
    const output = 'BTCUSD'
    expect(await pool.symbol()).toEqual(output)
  }, TIMEOUT)
  test('getStateValues', async() => {
    const res = await pool.getStateValues()
    expect(res).toHaveProperty('cumuFundingRate')
    expect(res).toHaveProperty('cumuFundingRateBlock')
    expect(res).toHaveProperty('liquidity')
    expect(res).toHaveProperty('tradersNetVolume')
    expect(res).toHaveProperty('tradersNetCost')
    expect(bg(res.liquidity).toNumber()).toBeGreaterThan(500)
  }, TIMEOUT)
  test('getParameters', async() => {
    const res = await pool.getParameters()
    expect(res).toHaveProperty('feeRatio')
    expect(res).toHaveProperty('fundingRateCoefficient')
    expect(res).toHaveProperty('liquidationCutRatio')
    expect(res).toHaveProperty('maxLiquidationReward')
    expect(res).toHaveProperty('minLiquidationReward')
    expect(res).toHaveProperty('minAddLiquidity')
    expect(res).toHaveProperty('minInitialMarginRatio')
    expect(res).toHaveProperty('minMaintenanceMarginRatio')
    expect(res).toHaveProperty('minPoolMarginRatio')
    expect(res).toHaveProperty('multiplier')
    expect(res).toHaveProperty('priceDelayAllowance')
    expect(res).toHaveProperty('redemptionFeeRatio')
    expect(res.multiplier.toString()).toEqual('0.0001')
  }, TIMEOUT)
})