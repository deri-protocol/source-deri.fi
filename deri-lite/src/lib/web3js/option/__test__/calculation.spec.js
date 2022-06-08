import { wrappedOracleFactory, bg } from "../../shared"
import { dynamicInitialMarginRatio } from "../calculation/trade"
import { CHAIN_ID, OPTION_POOL_ADDRESS, TIMEOUT } from "../../shared/__test__/setup"
import { everlastingOptionFactory } from "../factory"

describe('calculation', () => {
  it('dynamicInitialMarginRatio', async() => {
    const optionPool = everlastingOptionFactory(CHAIN_ID, OPTION_POOL_ADDRESS)
    const { initialMarginRatio } = await optionPool.getParameters()
    const symbol0 = await optionPool.getSymbol('2')
    const price = await (wrappedOracleFactory(CHAIN_ID, symbol0.oracleAddress)).getPrice()
    //console.log(price, symbol0, initialMarginRatio.toString())
    const res = dynamicInitialMarginRatio(price, symbol0.strikePrice, true, initialMarginRatio)
    expect(bg(res).toNumber()).toBeGreaterThanOrEqual(0.01)
  }, TIMEOUT)
})