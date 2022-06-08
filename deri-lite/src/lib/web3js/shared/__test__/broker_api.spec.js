import { getBroker } from "../api/activity_api";
import { POOL_V2_ADDRESS, ACCOUNT_ADDRESS, TIMEOUT } from "./setup";

describe('broker api', () => {
  test('getBroker', async () => {
    const res = await getBroker('97', POOL_V2_ADDRESS, ACCOUNT_ADDRESS)
    expect(res).toEqual('0x0000000000000000000000000000000000000000')
  }, TIMEOUT)
})