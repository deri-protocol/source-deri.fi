import {
  getFundingRate,
  getSpecification,
  getWalletBalance,
  isUnlocked,
  getEstimatedFundingRate,
  getLiquidityUsed,
  getEstimatedLiquidityUsed,
  getPositionInfo,
  getPositionInfos,
} from '../api/trade_query_api';
import {
  CHAIN_ID,
  ACCOUNT_ADDRESS,
  ACCOUNT2_ADDRESS,
  POOL_V2L_ADDRESS,
  TIMEOUT,
} from '../../shared/__test__/setup';
import { bg } from '../../shared/utils'
import { DeriEnv } from '../../shared';

describe('trade_query_api', () => {
  it(
    'getSpecification',
    async () => {
      const output = {
        symbol: 'BTCUSD',
        bTokenSymbol: 'BUSD',
        multiplier: '0.0001',
        feeRatio: '0.001',
        fundingRateCoefficient: '0.00005',
        minPoolMarginRatio: '1',
        minInitialMarginRatio: '0.1',
        minMaintenanceMarginRatio: '0.05',
        minLiquidationReward: '10',
        maxLiquidationReward: '1000',
        liquidationCutRatio: '0.5',
        protocolFeeCollectRatio: '0.2',
      };
      expect(await getSpecification(CHAIN_ID, POOL_V2L_ADDRESS, '5')).toEqual(
        output
      );
    },
    TIMEOUT
  );
  it('getPositionInfo', async () => {
    DeriEnv.set('prod')
    const res = await getPositionInfo(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT_ADDRESS, '0')
    DeriEnv.set('dev')
    expect(res).toHaveProperty('averageEntryPrice');
    expect(res).toHaveProperty('fundingFee');
    expect(res).toHaveProperty('liquidationPrice');
    expect(res).toHaveProperty('margin');
    expect(res).toHaveProperty('marginHeldBySymbol');
    expect(res).toHaveProperty('price');
    expect(res).toHaveProperty('unrealizedPnl');
    expect(res).toHaveProperty('unrealizedPnlList');
    expect(res).toHaveProperty('volume');
    expect(bg(res.price).toNumber()).toBeGreaterThanOrEqual(10);
    expect(bg(res.volume).toNumber()).toBeGreaterThanOrEqual(0);
    expect(bg(res.volume).toNumber()).toBeLessThanOrEqual(10000);
    expect(bg(res.margin).toNumber()).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.unrealizedPnlList)).toBe(true)
    expect(res).toEqual({})
  }, TIMEOUT);
  it('getPositionInfos', async () => {
    DeriEnv.set('prod')
    const res = await getPositionInfos(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT_ADDRESS, '0')
    DeriEnv.set('dev')
    expect(res).toEqual([])
  }, TIMEOUT);
  it(
    'getWalletBalance',
    async () => {
      const output = 35000
      const res = await getWalletBalance(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT_ADDRESS)
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(output);
    },
    TIMEOUT
  );
  it(
    'isUnlocked',
    async () => {
      expect(
        await isUnlocked(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT_ADDRESS)
      ).toEqual(true);
      expect(
        await isUnlocked(CHAIN_ID, POOL_V2L_ADDRESS, ACCOUNT2_ADDRESS)
      ).toEqual(false);
    },
    TIMEOUT
  );
  it(
    'getFundingRate',
    async () => {
      const res = await getFundingRate(CHAIN_ID, POOL_V2L_ADDRESS, '0')
      expect(res).toHaveProperty('fundingRate0');
      expect(res).toHaveProperty('fundingRatePerBlock');
      expect(res).toHaveProperty('liquidity');
      expect(res).toHaveProperty('tradersNetVolume');
      expect(res).toHaveProperty('volume');
      expect(bg(res.fundingRate0).toNumber()).toBeGreaterThanOrEqual(-0.1);
      expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(1000);
      expect(bg(res.tradersNetVolume).toNumber()).toBeGreaterThanOrEqual(-10000);
      expect(bg(res.tradersNetVolume).toNumber()).toBeLessThanOrEqual(10000);
    },
    TIMEOUT
  );
  it(
    'getEstimatedFundingRate',
    async () => {
      const output = 50
      const res = await getEstimatedFundingRate(CHAIN_ID, POOL_V2L_ADDRESS, '3', '0')
      expect(bg(res.fundingRate1).toNumber()).toBeLessThanOrEqual(output);
    },
    TIMEOUT
  );
  it('getLiquidityUsed', async () => {
    const minOutput = 0.01
    const maxOutput = 100
    const res = await getLiquidityUsed(CHAIN_ID, POOL_V2L_ADDRESS, '0')
    expect(bg(res.liquidityUsed0).toNumber()).toBeGreaterThanOrEqual(minOutput);
    expect(bg(res.liquidityUsed0).toNumber()).toBeLessThanOrEqual(maxOutput);
  });
  it('getEstimatedLiquidityUsed', async () => {
    const minOutput = 0.01
    const maxOutput = 100
    const res = await getEstimatedLiquidityUsed(CHAIN_ID, POOL_V2L_ADDRESS, '2', '0')
    expect(bg(res.liquidityUsed1).toNumber()).toBeGreaterThanOrEqual(minOutput);
    expect(bg(res.liquidityUsed1).toNumber()).toBeLessThanOrEqual(maxOutput);
  });
});
