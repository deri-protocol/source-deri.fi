import {
  TIMEOUT,
  CHAIN_ID,
  BTOKEN_ADDRESS,
  ACCOUNT_ADDRESS,
  ACCOUNT2_ADDRESS,
  POOL_V2L_ADDRESS,
  POOL_V2_ADDRESS,
} from './setup';
import { bTokenFactory, TERC20Factory } from '../factory';
import { bg } from '../utils'

describe('BToken', () => {
  let bToken;
  beforeAll(() => {
    bToken = bTokenFactory(CHAIN_ID, BTOKEN_ADDRESS);
  }, TIMEOUT);
  it('symbol()', async () => {
    expect(await bToken.symbol()).toEqual('BUSD');
  }, TIMEOUT);
  it('decimals()', async () => {
    expect(await bToken.decimals()).toEqual('18');
  }, TIMEOUT);
  it('balanceOf()', async () => {
    const output = 38003
    expect((await bToken.balanceOf(ACCOUNT_ADDRESS)).toNumber()).toBeGreaterThanOrEqual(output);
  }, TIMEOUT);
  it('totalSupply()', async () => {
    const output = 21700000
    expect((await bToken.totalSupply()).toNumber()).toBeGreaterThanOrEqual(output);
  }, TIMEOUT);
  it('isUnlocked()', async () => {
    expect(await bToken.isUnlocked(ACCOUNT_ADDRESS, POOL_V2_ADDRESS)).toEqual(true);
    expect(await bToken.isUnlocked(ACCOUNT2_ADDRESS, POOL_V2_ADDRESS)).toEqual(false);
    expect( await bToken.isUnlocked(ACCOUNT_ADDRESS, POOL_V2L_ADDRESS)).toEqual(true);
    expect( await bToken.isUnlocked(ACCOUNT2_ADDRESS, POOL_V2L_ADDRESS)).toEqual(false);
  }, TIMEOUT);
  it('balanceOf() TERC20', async () => {
    const testERC20 = TERC20Factory(CHAIN_ID, '0xaa2B8115c094445e96C2CD951c17a30F41867323');
    expect(bg(await testERC20.balanceOf(ACCOUNT_ADDRESS)).toNumber()).toBeGreaterThanOrEqual(2);
  }, TIMEOUT);
});
