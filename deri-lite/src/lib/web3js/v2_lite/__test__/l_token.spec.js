import { lTokenLiteFactory } from '../factory';
import { bg } from '../../shared/utils'
import {
  CHAIN_ID,
  LTOKEN_V2L_ADDRESS,
  POOL_V2L_ADDRESS,
  ACCOUNT_ADDRESS,
  TIMEOUT,
} from '../../shared/__test__/setup';

describe('lToken v2 lite', () => {
  let lToken;
  beforeAll(() => {
    lToken = lTokenLiteFactory(CHAIN_ID, LTOKEN_V2L_ADDRESS);
  });
  it('pool()', async () => {
    expect(await lToken.pool()).toEqual(POOL_V2L_ADDRESS);
  }, TIMEOUT);
  it('totalSupply()', async () => {
    const output = 65000
    expect(bg(await lToken.totalSupply()).toNumber()).toBeGreaterThanOrEqual(output);
  }, TIMEOUT);
  it('balanceOf()', async () => {
    const output = 100
    expect(bg(await lToken.balanceOf(ACCOUNT_ADDRESS)).toNumber()).toBeGreaterThanOrEqual(output);
  }, TIMEOUT);
});
