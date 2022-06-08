import { DeriEnv } from "../../shared"
import { ACCOUNT_ADDRESS, CHAIN_ID, POOL_V2_ADDRESS, TIMEOUT } from "../../shared/__test__/setup"
import { getTradeHistory } from "../api/trade_history_api"

describe('trade history', () => {
  it('getTradeHistory', async() => {
    //const res = await getTradeHistory(CHAIN_ID, POOL_V2_ADDRESS, ACCOUNT_ADDRESS, '0')
    DeriEnv.set('prod')
    const res = await getTradeHistory(
      '56',
      '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
      '0x1e066AfB0bfB060D3D288049869eD0FAf96A49cd',
      '0'
    );
    expect(res).toEqual([])
    DeriEnv.set('dev')
  }, TIMEOUT)
})