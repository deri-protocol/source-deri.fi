import { bg } from '../../shared/utils'
import {
  perpetualPoolFactory,
} from '../factory'
import {
  TIMEOUT,
  POOL_V2_ADDRESS,
  LTOKEN_V2_ADDRESS,
  PTOKEN_V2_ADDRESS,
  ROUTER_V2_ADDRESS,
  BTCUSD_ORACLE_V2_ADDRESS,
  BTOKEN_ADDRESS,
  PROTOCOL_FEE_COLLECTOR_V2,
} from '../../shared/__test__/setup';

describe('PerpetualPool', () => {
  let perpetualPool
  beforeAll(() => {
    perpetualPool = perpetualPoolFactory('97', POOL_V2_ADDRESS)
  })
  test('getLengths()', async() => {
    await perpetualPool.getLengths()
    expect(perpetualPool.bTokenCount).toEqual(3)
    expect(perpetualPool.symbolCount).toEqual(2)
  }, TIMEOUT)
  test('getAddresses()', async() => {
    const output = {
      lTokenAddress: LTOKEN_V2_ADDRESS,
      pTokenAddress: PTOKEN_V2_ADDRESS,
      routerAddress: ROUTER_V2_ADDRESS,
      protocolFeeCollector: PROTOCOL_FEE_COLLECTOR_V2,
    };
    await perpetualPool.getAddresses()
    expect(perpetualPool.lTokenAddress).toEqual(output.lTokenAddress)
    expect(perpetualPool.pTokenAddress).toEqual(output.pTokenAddress)
    expect(perpetualPool.routerAddress).toEqual(output.routerAddress)
    expect(perpetualPool.protocolFeeCollector).toEqual(output.protocolFeeCollector)
  }, TIMEOUT)
  test('getParameters()', async() => {
    const output = {
      decimals0: '18',
      minBToken0Ratio: bg(0.2),
      minPoolMarginRatio: bg(1),
      minInitialMarginRatio: bg(0.1),
      minMaintenanceMarginRatio: bg('0.05'),
      minLiquidationReward: bg('0'),
      maxLiquidationReward: bg('1000'),
      liquidationCutRatio: bg('0.5'),
      protocolFeeCollectRatio: bg(0.2),
    }
    const res = await perpetualPool.getParameters()
    expect(res).toEqual(output)
  }, TIMEOUT)
  test('getProtocolFeeAccrued()', async() => {
    const output = 0.56
    await perpetualPool.getProtocolFeeAccrued()
    expect(perpetualPool.protocolFeeAccrued.toNumber()).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)
  test('getBToken()', async() => {
    const input = '0'
    // const output = {
    //   bTokenAddress: BTOKEN_ADDRESS,
    //   swapperAddress: '0x4038191eFb39Fe1d21a48E061F8F14cF4981A0aF',
    //   oracleAddress: '0x0000000000000000000000000000000000000000',
    //   decimals: '18',
    //   discount: bg('1'),
    //   price: bg('1'),
    //   liquidity: bg('6009.99558635764855457'),
    //   pnl: bg('1652.829442776692341525'),
    //   cumulativePnl: bg('0.338632704460278345'),
    // };
    const res = await perpetualPool.getBToken(input)
    expect(res).toHaveProperty('bTokenAddress')
    expect(res).toHaveProperty('swapperAddress')
    expect(res).toHaveProperty('oracleAddress')
    expect(res).toHaveProperty('decimals')
    expect(res).toHaveProperty('discount')
    expect(res).toHaveProperty('liquidity')
    expect(res).toHaveProperty('pnl')
    expect(res).toHaveProperty('cumulativePnl')
    expect(res.bTokenAddress).toEqual(BTOKEN_ADDRESS)
    expect(bg(res.price).toNumber()).toBeGreaterThanOrEqual(1)
    expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(100000)
    expect(bg(res.decimals).toNumber()).toEqual(18)
    expect(bg(res.discount).toNumber()).toBeLessThanOrEqual(1)
    expect(bg(res.pnl).toNumber()).toBeGreaterThanOrEqual(-1000)
  }, TIMEOUT)
  test('getBTokenOracle()', async() => {
    const input = '0'
    const output = '0x0000000000000000000000000000000000000000'
    expect(await perpetualPool.getBTokenOracle(input)).toEqual(output)
  }, TIMEOUT)
  test('getSymbol()', async() => {
    const input = '0'
    const res =  await perpetualPool.getSymbol(input)
    expect(res).toHaveProperty('price')
    expect(res).toHaveProperty('symbol')
    expect(res).toHaveProperty('feeRatio')
    expect(res).toHaveProperty('cumulativeFundingRate')
    expect(res).toHaveProperty('fundingRateCoefficient')
    expect(res).toHaveProperty('multiplier')
    expect(res).toHaveProperty('oracleAddress')
    expect(res).toHaveProperty('tradersNetVolume')
    expect(res).toHaveProperty('tradersNetCost')
    expect(bg(res.price).toNumber()).toBeGreaterThanOrEqual(30000)
    expect(bg(res.tradersNetVolume).toNumber()).toBeGreaterThanOrEqual(0)
    expect(bg(res.tradersNetVolume).toNumber()).toBeLessThanOrEqual(100000)
    expect(bg(res.tradersNetCost).toNumber()).toBeGreaterThanOrEqual(1700)
  }, TIMEOUT)
  test('getSymbolOracle()', async() => {
    const input = '0'
    expect(await perpetualPool.getSymbolOracle(input)).toEqual(BTCUSD_ORACLE_V2_ADDRESS)
  }, TIMEOUT)
})