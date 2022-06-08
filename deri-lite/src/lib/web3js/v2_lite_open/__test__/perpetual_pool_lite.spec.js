import { TIMEOUT } from "../../shared/__test__/setup"
import { PerpetualPoolLite } from "../contract/perpetual_pool"

describe('Perpetual Pool Lite', () => {
  let perpetualPoolLite
  beforeAll(() => {
    //perpetualPoolLite = new PerpetualPoolLite(CHAIN_ID, '0x3422DcB21c32d91aDC8b7E89017e9BFC13ee2d42')
    perpetualPoolLite = new PerpetualPoolLite('56', '0x063E74AbB551907833Be79E2C8F279e3afc74711')
  })
  test('getSymbols', async() => {
    const res = await perpetualPoolLite.getSymbols()
    expect(res.length).toEqual(2)
  }, TIMEOUT)
  test('getConfig', async() => {
    const res = await perpetualPoolLite.getConfig()
    expect(res).toHaveProperty('bToken', expect.any(String))
    expect(res).toHaveProperty('bTokenSymbol', expect.any(String))
    expect(res).toHaveProperty('pToken', expect.any(String))
    expect(res).toHaveProperty('pool', expect.any(String))
    expect(res).toHaveProperty('lToken', expect.any(String))
    expect(res).toHaveProperty('symbols', expect.any(Array))
    expect(res).toEqual({})
  }, TIMEOUT)
})