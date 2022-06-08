import { DeriEnv } from "../../shared"
import { ACCOUNT_ADDRESS, CHAIN_ID, POOL_V2L_ADDRESS, TIMEOUT } from "../../shared/__test__/setup"
import { getTradeHistory } from "../api/trade_history_api"

describe('trade history', () => {
  it('getTradeHistory', async() => {
    DeriEnv.set('prod')
    const res = await getTradeHistory(
      '56',
      '0x3465A2a1D7523DAF811B1abE63bD9aE36D2753e0',
      '0xFefC938c543751babc46cc1D662B982bd1636721',
      //'0xF6C30744a720B98Ca938F57a06F8cB06eB2c0562',
      //'0x6746cCFCbDA2dd4c3f1ef35839F97C064d687273',
      '0'
    );
    expect(res).toEqual([])
    DeriEnv.set('dev')
  }, TIMEOUT)
})
