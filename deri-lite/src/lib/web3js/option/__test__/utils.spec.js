import { TIMEOUT } from "../../shared/__test__/setup"
import { volatilitiesCache, volatilitiesCache2, volatilityCache } from "../utils"


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('cache', () => {
  it('volitilitiesCache', async() => {
    let res = await volatilitiesCache.get(['BTCUSD-50000-C', 'ETHUSD-4000-C'])
    res = await volatilitiesCache.get(['BTCUSD-50000-C', 'ETHUSD-4000-C'])
    res = await volatilitiesCache.get(['BTCUSD-50000-C', 'ETHUSD-4000-C'])
    await delay(5000)
    res = await volatilitiesCache.get(['BTCUSD-50000-C', 'ETHUSD-4000-C'])
    expect(res).toEqual('')
  }, TIMEOUT)
  it('volitilityCache', async() => {
    let res = await volatilityCache.get('VOL-BTCUSD')
    res = await volatilityCache.get('VOL-BTCUSD')
    res = await volatilityCache.get('VOL-BTCUSD')
    await delay(5000)
    res = await volatilityCache.get('VOL-BTCUSD')
    expect(res).toEqual('')
  }, TIMEOUT)
  it('volitilityCache2', async() => {
    let res = await volatilitiesCache2(['VOL-BTCUSD', 'VOL-ETHUSD'])
    res = await volatilitiesCache2(['VOL-BTCUSD', 'VOL-ETHUSD'])
    await delay(5000)
    res = await volatilitiesCache2(['VOL-BTCUSD', 'VOL-ETHUSD'])
    expect(res).toEqual('')
  }, TIMEOUT)
})