import { DeriEnv } from "../../shared"
import { CHAIN_ID, TIMEOUT } from "../../shared/__test__/setup"
import {
  getExpandedPoolOpenConfigList,
  getPoolAcitveSymbolIds,
  getPoolAllSymbolNames,
  getPoolController,
  getPoolOpenConfigList,
  getPoolOpenOracleList,
  isPoolController,
} from '../api/query_api';

describe('v2_lite_open api',() => {
  it('getPoolOpenConfigList', async() => {
    const res = await getPoolOpenConfigList(CHAIN_ID)
    expect(res).toEqual([])
    // DeriEnv.set('prod')
    // const res = await getPoolOpenConfigList('56')
    // DeriEnv.set('dev')
    // expect(res).toEqual([])
  }, TIMEOUT)
  it('getExpandPoolOpenConfigList', async() => {
    DeriEnv.set('prod')
    const res = await getExpandedPoolOpenConfigList()
    DeriEnv.set('dev')
    expect(res).toEqual([])
  }, TIMEOUT)
  it('getPoolOpenOracleList', async() => {
    const res = await getPoolOpenOracleList('97', '0x2bAa211D7E62593bA379dF362F23e7B813d760Ad')
    expect(res.length).toEqual(3)
    expect(res[0].address).toEqual('0x8708Dda3A108cC1a92AF9013cbB6E7594e87520b')
    expect(res[0].symbol).toEqual('DOTUSD')
  }, TIMEOUT)
  it('getPoolController', async() => {
    expect(await getPoolController('97', '0x6045E17Fb8BB3ECE597a9F4BA5AfB275A8129A8B')).toEqual('0x4C059dD7b01AAECDaA3d2cAf4478f17b9c690080')
    DeriEnv.set('prod')
    expect(await getPoolController('56', '0x063E74AbB551907833Be79E2C8F279e3afc74711')).toEqual('0xE2ce09b2aa18Fe63aED37c49259Ae84827c9AE18')
    DeriEnv.set('dev')
  }, TIMEOUT)
  it('isPoolController', async() => {
    expect(await isPoolController('97', '0x6045E17Fb8BB3ECE597a9F4BA5AfB275A8129A8B', '0x4C059dD7b01AAECDaA3d2cAf4478f17b9c690080')).toEqual(true)
    expect(await isPoolController('97', '0x6045E17Fb8BB3ECE597a9F4BA5AfB275A8129A8B', '0x4C059dD7b01AAECDaA3d2cAf4478f17b9c690082')).toEqual(false)
    DeriEnv.set('prod')
    expect(await isPoolController('56', '0x063E74AbB551907833Be79E2C8F279e3afc74711','0xE2ce09b2aa18Fe63aED37c49259Ae84827c9AE18')).toEqual(true)
    DeriEnv.set('dev')
  }, TIMEOUT)
  it('getPoolAllSymbolNames', async() => {
    DeriEnv.set('prod')
    expect(await getPoolAllSymbolNames('56', '0x063E74AbB551907833Be79E2C8F279e3afc74711')).toEqual(['', ''])
    DeriEnv.set('dev')
  }, TIMEOUT)
  it('getPoolActiveSymbolIds', async() => {
    DeriEnv.set('prod')
    expect(await getPoolAcitveSymbolIds('56', '0x063E74AbB551907833Be79E2C8F279e3afc74711')).toEqual(['0', '1'])
    DeriEnv.set('dev')
  }, TIMEOUT)
})