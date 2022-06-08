import { DeriEnv } from '../../shared/config'
import { bg } from '../../shared/utils'
// import {
//   getPoolBTokensBySymbolId,
//   getWalletBalance,
//   getSpecification,
//   getPositionInfo,
//   isUnlocked,
//   getEstimatedMargin,
//   getFundingRate,
//   getLiquidityUsed,
//   getEstimatedFundingRate,
//   getEstimatedLiquidityUsed,
//   getEstimatedFee,
//   // getFundingFee
// } from '../api/mining_query_api'
import {
  getPoolBTokensBySymbolId,
  getWalletBalance,
  getSpecification,
  getPositionInfo,
  getPositionInfos,
  isUnlocked,
  getEstimatedMargin,
  getFundingRate,
  getLiquidityUsed,
  getEstimatedFundingRate,
  getEstimatedLiquidityUsed,
  getEstimatedFee,
  getEstimatedLiquidatePrice,
  // getFundingFee
} from '../api/trade_query_api'
import { TIMEOUT, POOL_V2_ADDRESS, ACCOUNT_ADDRESS } from '../../shared/__test__/setup';

describe('Trade query api', () => {
  it('getSpecification()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '0', '0', true]
    const output = {
      symbol: 'BTCUSD',
      bTokenSymbol: ['BUSD', 'AUTO', 'CAKE'],
      bTokenMultiplier: ['1', '0.5', '0.5'],
      multiplier: '0.0001',
      feeRatio: '0.0005',
      minPoolMarginRatio: '1',
      minInitialMarginRatio: '0.1',
      minMaintenanceMarginRatio: '0.05',
      //minAddLiquidity: minAddLiquidity.toString(),
      //redemptionFeeRatio: redemptionFeeRatio.toString(),
      fundingRateCoefficient: '0.0000005',
      minLiquidationReward: '0',
      maxLiquidationReward: '1000',
      liquidationCutRatio: '0.5',
      protocolFeeCollectRatio: '0.2',
      indexConstituents: {
        tokens: [],
        url: '',
      },
    };
    expect(await getSpecification(...input)).toEqual(output)
  }, TIMEOUT)
  it('getWalletBalance()', async() => {
    const input = ['97', POOL_V2_ADDRESS, ACCOUNT_ADDRESS, '0', true]
    const output = 20000
    expect(bg(await getWalletBalance(...input)).toNumber()).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)
  it('getPoolBTokenBySymbol()', async() => {
    const input = ['97', POOL_V2_ADDRESS, ACCOUNT_ADDRESS, '0', true]
    const res = await getPoolBTokensBySymbolId(...input)
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toEqual(3)
    expect(res[0]).toHaveProperty('bTokenAddress');
    expect(res[0]).toHaveProperty('bTokenId');
    expect(res[0]).toHaveProperty('bTokenSymbol');
    expect(res[0]).toHaveProperty('walletBalance');
    expect(res[0]).toHaveProperty('availableBalance');
    expect(bg(res[0].walletBalance).toNumber()).toBeGreaterThanOrEqual(1000);
    expect(bg(res[0].availableBalance).toNumber()).toBeGreaterThanOrEqual(100);
    expect(res[0].bTokenSymbol).toEqual('BUSD');
    expect(res[1].bTokenSymbol).toEqual('AUTO');
    expect(res[2].bTokenSymbol).toEqual('CAKE');
  }, TIMEOUT)
  it('getPositionInfo()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF', '0']
    const res = await getPositionInfo(...input)

    expect(res).toHaveProperty('averageEntryPrice');
    expect(res).toHaveProperty('liquidationPrice');
    expect(res).toHaveProperty('margin');
    expect(res).toHaveProperty('marginHeld');
    expect(res).toHaveProperty('marginHeldBySymbol');
    expect(res).toHaveProperty('price');
    expect(res).toHaveProperty('unrealizedPnl');
    expect(res).toHaveProperty('unrealizedPnlList');
    expect(res).toHaveProperty('volume');
    expect(bg(res.price).toNumber()).toBeGreaterThanOrEqual(10000);
    expect(bg(res.volume).toNumber()).toBeGreaterThanOrEqual(0);
    expect(bg(res.volume).toNumber()).toBeLessThanOrEqual(10000);
    expect(bg(res.margin).toNumber()).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.unrealizedPnlList)).toBe(true)

    expect(res).toEqual({});

    const input2 = ['97', POOL_V2_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF', '500', '0']
    expect(await getEstimatedLiquidatePrice(...input2)).toEqual('')
  }, TIMEOUT)
  it('getPositionInfos()', async () => {
    const res = await getPositionInfos('97', POOL_V2_ADDRESS, ACCOUNT_ADDRESS)
    expect(res).toEqual([])
  }, TIMEOUT);
  it('isUnlocked()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF', '0', true]
    const output = true
    expect(await isUnlocked(...input)).toEqual(output)
  }, TIMEOUT)
  it('getEstimatedMargin()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF', '5', '3', '0', true]
    const minOutput = 0
    const maxOutput = 100
    const res = bg(await getEstimatedMargin(...input)).toNumber()
    expect(res).toBeGreaterThanOrEqual(minOutput)
    expect(res).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
  // it('getEstimatedFee()', async() => {
  //   const input = ['97', POOL_ADDRESS, '5', '0', '0', true]
  //   const output = ''
  //   expect(await getEstimatedFee(...input)).toEqual(output)
  // }, TIMEOUT)
  it('getFundingRate()', async() => {
    const input = ['97', POOL_V2_ADDRESS,'0', true]
    const res = await getFundingRate(...input)

    expect(res).toHaveProperty('fundingRate0');
    expect(res).toHaveProperty('fundingRatePerBlock');
    expect(res).toHaveProperty('liquidity');
    expect(res).toHaveProperty('tradersNetVolume');
    expect(res).toHaveProperty('volume');
    expect(bg(res.fundingRate0).toNumber()).toBeGreaterThanOrEqual(0.05);
    expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(10000);
    expect(bg(res.tradersNetVolume).toNumber()).toBeGreaterThanOrEqual(10);
    expect(bg(res.tradersNetVolume).toNumber()).toBeLessThanOrEqual(100000);
  }, TIMEOUT)
  it('getEstimatedFundingRate()', async() => {
    const input = ['97', POOL_V2_ADDRESS, '8', '0', true]
    const output = 25
    expect(bg((await getEstimatedFundingRate(...input)).fundingRate1).toNumber()).toBeLessThanOrEqual(output)
  }, TIMEOUT)
  it('getLiquidityUsed()', async() => {
    const input = ['97', POOL_V2_ADDRESS,'1', true]
    const minOutput = 0
    const maxOutput = 100
    expect(bg((await getLiquidityUsed(...input)).liquidityUsed0).toNumber()).toBeLessThanOrEqual(maxOutput)
    expect(bg((await getLiquidityUsed(...input)).liquidityUsed0).toNumber()).toBeGreaterThanOrEqual(minOutput)
  }, TIMEOUT)
  it('getEstimatedLiquidityUsed()', async() => {
    const input = ['97', POOL_V2_ADDRESS,'8', '1', true]
    const maxOutput = 100
    expect(bg((await getEstimatedLiquidityUsed(...input)).liquidityUsed1).toNumber()).toBeLessThanOrEqual(maxOutput)
  }, TIMEOUT)
  it('getEstimatedFee()', async() => {
    const input = ['97', POOL_V2_ADDRESS,'8', '0', true]
    const output = 0.03
    expect(bg(await getEstimatedFee(...input)).toNumber()).toBeLessThanOrEqual(output)
  }, TIMEOUT)

  it('getFundingFee()', async() => {
    const output = 1
    DeriEnv.set('prod')
    const fundingFee2 = (await getPositionInfo('56', '0x19c2655A0e1639B189FB0CF06e02DC0254419D92', '0x3fA3f80f18De2528755b9054E23525c0fbf597Fe', '0')).fundingFee
    DeriEnv.set('dev')
    expect(bg(fundingFee2).toNumber()).toBeLessThanOrEqual(output)
  }, TIMEOUT)

  // it('getFundingFee2()', async() => {
  //   const output = '-21.998'
  //   // const fundingFee = await getFundingFee('97', POOL_ADDRESS, ACCOUNT_ADDRESS, '0')
  //   // expect(fundingFee).toEqual(output)
  //   DeriEnv.set('prod')
  //   const fundingFee2 = await getFundingFee('56', '0x19c2655A0e1639B189FB0CF06e02DC0254419D92', '0x6746cCFCbDA2dd4c3f1ef35839F97C064d687273', '1')
  //   DeriEnv.set('dev')
  //   expect(fundingFee2).toEqual(output)
  // }, TIMEOUT)
  it('getPoolBTokenBySymbol()', async () => {
    DeriEnv.set('prod')
    const input = [
      '56',
      '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
      '0x6746ccfcbda2dd4c3f1ef35839f97c064d687273',
      '0',
    ];
    const res = await getPoolBTokensBySymbolId(...input);
    expect(res).toEqual({})
    DeriEnv.set('dev')
  });
})
