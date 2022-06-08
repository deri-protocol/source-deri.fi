import { getTradeHistory } from '../api/trade_history_api'

describe('trade history v2 dpmm', () => {
  it('getTradeHistory', async() => {
    const res = await getTradeHistory(
      '97',
      '0x520b3df50C0E08B3A3cEbd6f7a47A133E5F574C0',
      '0xFefC938c543751babc46cc1D662B982bd1636721',
      '0'
    );
    expect(res).toEqual([])
  }, 30000)
})