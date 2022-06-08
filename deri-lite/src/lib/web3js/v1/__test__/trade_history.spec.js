import { DeriEnv } from "../../shared"
import { ACCOUNT_ADDRESS, CHAIN_ID, POOL_V1_ADDRESS, TIMEOUT } from "../../shared/__test__/setup"
import { getTradeHistory2 } from "../api"

describe('trade history', () => {
  it('getTradeHistory', async() => {
    DeriEnv.set('prod')
    const res = await getTradeHistory2(
      '56',
      '0xAf081e1426f64e74117aD5F695D2A80482679DE5',
      '0xFefC938c543751babc46cc1D662B982bd1636721'
    );
    expect(res).toEqual([])
    DeriEnv.set('dev')
  }, TIMEOUT)
})