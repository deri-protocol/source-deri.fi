import { databaseFactory } from "../factory"
import { deriToNatural, hexToNumberString} from "../utils"
import { TIMEOUT, CHAIN_ID } from "./setup"

describe('database', () => {
  it('getPoolLiquidity', async() => {
    const db = databaseFactory()
    const key = `${CHAIN_ID}.0x3422DcB21c32d91aDC8b7E89017e9BFC13ee2d42.liquidity`
    const res = await db.getValues([key])
    const output = 15000000 
    expect(deriToNatural(hexToNumberString(res[0])).toNumber()).toBeGreaterThan(output)
  }, TIMEOUT)
})