import { isUserPTokenExist, getAirdropPTokenWhitelistCount } from "../api/activity_api";
import { pTokenAirdropFactory } from "../factory"
import { ACCOUNT_ADDRESS, ACCOUNT2_ADDRESS, TIMEOUT } from './setup';

describe('PTokenAiredrop', () => {
  it('getBTokenBalance', async() => {
    const output = '998500000000000000000'
    expect(await pTokenAirdropFactory('97', '0xbBa30228227aba02172cF39b28C22BdE5F3ee545').getBTokenBalance()).toEqual(output)
  }, TIMEOUT)
  it('isUserPTokenExist', async() => {
    expect(await isUserPTokenExist('97', '0x54a71Cad29C314eA081b2B0b1Ac25a7cE3b7f7A5', ACCOUNT_ADDRESS)).toEqual(true)
    expect(await isUserPTokenExist('97', '0x54a71Cad29C314eA081b2B0b1Ac25a7cE3b7f7A5', ACCOUNT2_ADDRESS)).toEqual(false)
  }, TIMEOUT)
  it('getAirdropWhitelistCount', async() => {
    const output = '3'
    expect(await getAirdropPTokenWhitelistCount('97')).toEqual(output)
  }, TIMEOUT)
})