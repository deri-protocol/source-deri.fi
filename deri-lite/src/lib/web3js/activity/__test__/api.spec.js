import { ACCOUNT2_ADDRESS, ACCOUNT_ADDRESS, TIMEOUT } from "../../shared/__test__/setup";
import { hasRequiredBalance, isBTokenUnlocked, isPTokenAirdropped, isUserPTokenExist, totalAirdropCount } from "../api/ptoken_airdrop";

const POOL_ADDRESS = '0xb18e2815c005a99BE77c8719c79ec2451A59aDAD'

describe('PToken airdrop', () => {
  it('isPTokenAirdropped', async() => {
    expect(await isPTokenAirdropped('97', ACCOUNT_ADDRESS)).toEqual(true)
    expect(await isPTokenAirdropped('97', ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT);
  it('totalAirdropCount', async() => {
    expect(await totalAirdropCount('97')).toEqual('2')
  }, TIMEOUT);
  it('isUserPTokenExist', async() => {
    expect(await isUserPTokenExist('97', POOL_ADDRESS, ACCOUNT_ADDRESS)).toEqual(true)
    expect(await isUserPTokenExist('97', POOL_ADDRESS, ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT);
  it('isBTokenUnlocked', async() => {
    expect(await isBTokenUnlocked('97', POOL_ADDRESS, ACCOUNT_ADDRESS)).toEqual(true)
    expect(await isBTokenUnlocked('97', POOL_ADDRESS, ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT);
  it('hasRequiredBalance', async() => {
    expect(await hasRequiredBalance('97', POOL_ADDRESS, ACCOUNT_ADDRESS)).toEqual(true)
    expect(await hasRequiredBalance('97', POOL_ADDRESS, ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT);
});
