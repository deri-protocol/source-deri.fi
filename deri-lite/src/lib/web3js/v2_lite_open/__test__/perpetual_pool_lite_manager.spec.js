import { CHAIN_ID, TIMEOUT } from "../../shared/__test__/setup"
import { PerpetualPoolLiteManager } from "../contract/perpetual_pool_lite_manager"

describe('Perpetual Pool Lite Manager', () => {
  let perpetualPoolLiteManager
  beforeAll(() => {
    perpetualPoolLiteManager = new PerpetualPoolLiteManager(CHAIN_ID, '0x7A55ed377361802fad1Ae3d944cDbAA3c7694757')
  })
  test('poolTemplate', async() => {
    expect(await perpetualPoolLiteManager.poolTemplate()).toEqual('0xf3e5756e4B293761fA073d7C9615Dd0c5EBf5500')
  }, TIMEOUT)
  test('getNumPools', async() => {
    expect(await perpetualPoolLiteManager.getNumPools()).toEqual('2')
  }, TIMEOUT)
  test('pools', async() => {
    expect(await perpetualPoolLiteManager.pools('1')).toEqual('0xF9F9a283DaEEF6069200D705A09FEAb3195D85ed')
  }, TIMEOUT)
})