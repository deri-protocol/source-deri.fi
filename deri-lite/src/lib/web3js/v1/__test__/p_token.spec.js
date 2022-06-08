import { pTokenFactory } from "../factory"
import { bg } from '../../shared/utils'
import { chainId, pTokenAddress, ACCOUNT_ADDRESS, TIMEOUT, ACCOUNT2_ADDRESS } from "./setup"

describe('pToken', () => {
  let pToken
  beforeAll(() => {
    pToken = pTokenFactory(chainId, pTokenAddress)
  })
  test('exists', async() => {
    const res = await pToken.exists(ACCOUNT_ADDRESS)
    expect(res).toEqual(true)
    const res2 = await pToken.exists(ACCOUNT2_ADDRESS)
    expect(res2).toEqual(false)
  }, TIMEOUT)
  test(
    'getPositionInfo',
    async () => {
      const output = {
        cost: '0',
        margin: '500',
        volume: '0',
        lastCumuFundingRate: '-0.026973245879634046',
        lastUpdateTimestamp: '1625036654',
      };
      const res = await pToken.getPositionInfo(ACCOUNT_ADDRESS);
      expect(res).toHaveProperty('cost');
      expect(res).toHaveProperty('volume');
      expect(res).toHaveProperty('lastUpdateTimestamp');
      expect(res).toHaveProperty('lastCumuFundingRate');
      expect(bg(res.margin).toNumber()).toBeGreaterThanOrEqual(0);
      expect(bg(res.margin).toNumber()).toBeLessThan(bg(output.margin).toNumber());
    },
    TIMEOUT
  );
})