import { TIMEOUT } from "../../shared/__test__/setup"
import { chainlinkFeedFactory } from "../factory"

describe('Chainlink Feed', () => {
  it('symbol', async() => {
    const feed = chainlinkFeedFactory('97', '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7') 
    expect(await feed.symbol()).toEqual('ETHUSD')
  }, TIMEOUT)
})