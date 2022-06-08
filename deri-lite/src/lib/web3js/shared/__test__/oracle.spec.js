import { bg, toWei } from '../utils'
import { oracleFactory } from '../factory'
import { getOraclePriceForOption, getPriceFromRest, getOraclePricesForOption, getOracleVolatilitiesForOption, getOracleVolatilityForOption, oraclePricesCache } from '../utils/oracle'
import { CHAIN_ID, TIMEOUT } from './setup'
import { DeriEnv } from '../config/env'

describe("oracle", () => {
  test('oracle BSC BTCUSD getPrice()', async() => {
    const btcusdOracle = oracleFactory('56', '0xe5709F0a23aEA3A61B0db91E92458fb6a0a55857', 'BTCUSD', '18')
    const price = await btcusdOracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(10000)
  }, TIMEOUT)
  test('oracle BSC ETHUSD getPrice()', async() => {
    const btcusdOracle = oracleFactory('56', '0xA0F51e28Ec15fcC9816FaB40684f1D1C675Bd39b', 'ETHUSD', '18')
    const price = await btcusdOracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1000)
  }, TIMEOUT)
  test('oracle BSC BNBUSD getPrice()', async() => {
    const btcusdOracle = oracleFactory('56', '0xa356c0559e0DdFF9281bF8f061035E7097a84Fa4', 'BNBUSD', '18')
    const price = await btcusdOracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(100)
  }, TIMEOUT)
  test('chainlink MUMBAI ETCUSD getPrice()', async() => {
    const btcusdOracle = oracleFactory('80001', '0xc0797C024e79E6e4D9473aE00c7fFCD4cce84Cc8', 'ETHUSD', '18' )
    const price = await btcusdOracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1000)
  }, TIMEOUT)
  test('chainlink MUMBAI MATICUSD getPrice()', async() => {
    const btcusdOracle = oracleFactory('80001', '0x002685d9aD90bE8DECf61544EA48a37A0D7c4710', 'MATICUSD', '18' )
    const price = await btcusdOracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1)
  }, TIMEOUT)
  test('oracle MATIC BTCUSD getPrice()', async() => {
    const oracle = oracleFactory('137', '0xe079ed411716d71fc746C403fa56fb38243Ab34F', 'BTCUSD', '18')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(10000)
  }, TIMEOUT)
  test('oracle MATIC ETH getPrice()', async() => {
    const oracle = oracleFactory('137', '0xea830185A2a1719967386E17C479f2539B0F915E', 'ETHUSD', '18')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1000)
  }, TIMEOUT)
  test('wrapped oracle bsctestnet BTCUSD getPrice()', async() => {
    const oracle = oracleFactory('97', '0x78Db6d02EE87260a5D825B31616B5C29f927E430', 'BTCUSD')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(10000)
  }, TIMEOUT)
  test('wrapped oracle bsctestnet ETHUSD getPrice()', async() => {
    const oracle = oracleFactory('97', '0xdF0050D6A07C19C6F6505d3e66B68c29F41edA09', 'BTCUSD')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1000)
  }, TIMEOUT)
  test('offchain oracle bsctestnet AXSUSDT getPrice()', async() => {
    const oracle = oracleFactory('97', '0x63F73b157Ee52dE3c3f9248753a05Aa5649B6f87', 'AXSUSDT')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(10)
  }, TIMEOUT)
  test('offchain oracle bsctestnet MBOXUSDT getPrice()', async() => {
    const oracle = oracleFactory('97', '0xB6cce9FAf4bB63bD4060aaDB311Cfb216aF91C36', 'MBOXUSDT')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1)
  }, TIMEOUT)
  test('offchain oracle bsctestnet IBSCDEFI getPrice()', async() => {
    const oracle = oracleFactory('97', '0x38e84505697A25ad0c279E6D0b85EBc9712118BA', 'IBSCDEFI')
    const price = await oracle.getPrice()
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(50)
    expect(bg(price).toNumber()).toBeLessThanOrEqual(200)
  }, TIMEOUT)
  test('getPricePriceFromRest AXSUSDT', async() => {
    const price = await getPriceFromRest('AXSUSDT')
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(15)
  }, TIMEOUT)
  test('getOraclePriceForOption', async() => {
    const price = await getOraclePriceForOption(CHAIN_ID, 'BTCUSD-20000-C')
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(30000)
  }, TIMEOUT)
  test('getOraclePricesForOption()', async() => {
    const input  = ['BTCUSD-30000-C', 'BTCUSD-40000-C', 'ETHUSD-3000-C', 'BTCUSD-50000-P']
    const res = await getOraclePricesForOption(CHAIN_ID, input);
    expect(res.length).toEqual(4);
    expect(bg(res[2]).toNumber()).toBeLessThanOrEqual(10000000000000000000000);
    expect(bg(res[3]).toNumber()).toBeGreaterThanOrEqual(10000);
  }, TIMEOUT)
  test('getOracleVolatilitiesForOption()', async() => {
    const input  = ['BTCUSD-30000-C', 'BTCUSD-40000-C', 'ETHUSD-3000-C', 'BTCUSD-50000-P']
    const res = (await getOracleVolatilitiesForOption(input)).map((s) => s.volatility);
    expect(res.length).toEqual(4);
    expect(bg(res[2]).toNumber()).toBeGreaterThanOrEqual(0);
    expect(bg(res[2]).toNumber()).toBeLessThanOrEqual(parseInt(toWei('1.5')));
    expect(bg(res[3]).toNumber()).toBeLessThanOrEqual(parseInt(toWei('1.5')));
  }, TIMEOUT)
  test('woo oracle bsc BTCUSD getPrice()', async() => {
    DeriEnv.set('prod')
    const oracle = oracleFactory('56', '0xC686B6336c0F949EAdFa5D61C4aAaE5Fe0687302', 'BTCUSD')
    const price = await oracle.getPrice()
    DeriEnv.set('dev')
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(10000)
  }, TIMEOUT)
  test('woo oracle bsc ETHUSD getPrice()', async() => {
    DeriEnv.set('prod')
    const oracle = oracleFactory('56', '0x60Dda0aD29f033d36189bCe4C818fe9Ce3a95206', 'ETHUSD')
    const price = await oracle.getPrice()
    DeriEnv.set('dev')
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(1000)
  }, TIMEOUT)
  test('woo oracle bsc BNBUSD getPrice()', async() => {
    DeriEnv.set('prod')
    const oracle = oracleFactory('56', '0xa356c0559e0DdFF9281bF8f061035E7097a84Fa4', 'BNBUSD')
    const price = await oracle.getPrice()
    DeriEnv.set('dev')
    expect(bg(price).toNumber()).toBeGreaterThanOrEqual(100)
  }, TIMEOUT)
  test('getOracleVolatilitiesForOption', async() => {
    const res = (await getOracleVolatilitiesForOption(['BTCUSD-50000-P', 'ETHUSD-4000-C', 'BTCUSD-60000-C'])).map((s) => s.volatility)
    expect(res).toEqual([])
  }, TIMEOUT)
  test('getOracleVolatilityForOption', async() => {
    const res = await getOracleVolatilityForOption(['BTCUSD-50000-P', 'ETHUSD-4000-C', 'BTCUSD-60000-C'])
    expect(res).toEqual([])
  }, TIMEOUT)
  test('oraclePricesCache', async() => {
    let res
    res = await oraclePricesCache.get(['AXSUSDT', 'MBOXUSDT', 'IGAME'])
    res = await oraclePricesCache.get(['AXSUSDT', 'MBOXUSDT', 'IGAME'])
    res = await oraclePricesCache.get(['AXSUSDT', 'MBOXUSDT', 'IGAME'])
    expect(res).toEqual([])
  }, TIMEOUT)
})
