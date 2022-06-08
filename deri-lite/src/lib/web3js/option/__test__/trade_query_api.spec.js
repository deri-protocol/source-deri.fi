import {
  ACCOUNT_ADDRESS,
  CHAIN_ID,
  MIN_NUMBER,
  OPTION_POOL_ADDRESS,
  TIMEOUT,
} from '../../shared/__test__/setup';
import { bg, DeriEnv } from '../../shared';
import {
  getEstimatedFee,
  getEstimatedLiquidityUsed,
  getEstimatedMargin,
  getEstimatedTimePrice,
  getFundingRate,
  getLiquidityUsed,
  getPositionInfo,
  getPositionInfos,
  getSpecification,
  getVolatility,
} from '../api/trade_query_api';

describe('trade query api', () => {
  it(
    'getSpecification',
    async () => {
      const res = await getSpecification(CHAIN_ID, OPTION_POOL_ADDRESS, '0');
      expect(res).toEqual({
        bTokenSymbol: 'BUSD',
        feeRatio: '0.005',
        initialMarginRatioOrigin: '0.1',
        initialMarginRatio: expect.any(String),
        liquidationCutRatio: '0.5',
        maintenanceMarginRatioOrigin: '0.05',
        maintenanceMarginRatio: expect.any(String),
        maxLiquidationReward: '1000',
        minLiquidationReward: '10',
        multiplier: '0.001',
        protocolFeeCollectRatio: '0.2',
        symbol: 'BTCUSD-50000-C',
        isCall: true,
      });
    },
    TIMEOUT
  );
  it(
    'getPositionInfo',
    async () => {
      const res = await getPositionInfo(
        CHAIN_ID,
        OPTION_POOL_ADDRESS,
        ACCOUNT_ADDRESS,
        '0'
      );

      expect(res).toHaveProperty('volume', expect.any(String))
      expect(res).toHaveProperty('margin', expect.any(String))
      expect(res).toHaveProperty('marginHeld', expect.any(String))
      expect(res).toHaveProperty('marginHeldBySymbol')
      expect(res).toHaveProperty('price', expect.any(String))
      expect(res).toHaveProperty('averageEntryPrice', expect.any(String))
      expect(res).toHaveProperty('liquidationPrice', expect.any(Object))
      expect(res).toHaveProperty('unrealizedPnl', expect.any(String))
      expect(res).toHaveProperty('unrealizedPnlList', expect.any(Array))
      expect(res).toHaveProperty('averageEntryPrice', expect.any(String))
      expect(res).toHaveProperty('premiumFundingAccrued', expect.any(String))

      expect(bg(res.margin).toNumber()).toBeGreaterThanOrEqual(0);
      expect(bg(res.averageEntryPrice).toNumber()).toBeGreaterThanOrEqual(0);
      expect(bg(res.price).toNumber()).toBeGreaterThanOrEqual(2000);
      expect(res.isCall).toEqual(true);
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getPositionInfos',
    async () => {
      const res = await getPositionInfos(
        CHAIN_ID,
        OPTION_POOL_ADDRESS,
        //'0x4C059dD7b01AAECDaA3d2cAf4478f17b9c690080',
        ACCOUNT_ADDRESS,
      );
      expect(res.length).toEqual(2);
      expect(res[0]).toEqual({});
      //expect(res[14]).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getEstimateMargin',
    async () => {
      const res = await getEstimatedMargin(
        CHAIN_ID,
        OPTION_POOL_ADDRESS,
        ACCOUNT_ADDRESS,
        '5',
        '3',
        '0'
      );
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(10);
    },
    TIMEOUT
  );
  it(
    'getFundingRate',
    async () => {
      const res = await getFundingRate(CHAIN_ID, OPTION_POOL_ADDRESS, '0');
      expect(res).toHaveProperty('liquidity')
      expect(res).toHaveProperty('premiumFunding0')
      expect(res).toHaveProperty('premiumFundingPerSecond')
      expect(res).toHaveProperty('tradersNetVolume')
      expect(res).toHaveProperty('volume')
      expect(bg(res.tradersNetVolume).abs().toNumber()).toBeLessThanOrEqual(
        100000
      );
      expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(1000);
      //expect(res).toEqual({});
    },
    TIMEOUT
  );
  // it(
  //   'getEstimatedFundingRate',
  //   async () => {
  //     const res = await getEstimatedFundingRate(
  //       CHAIN_ID,
  //       OPTION_POOL_ADDRESS,
  //       '12',
  //       '0'
  //     );
  //     expect(bg(res.deltaFunding1).abs().toNumber()).toBeGreaterThanOrEqual(0)
  //     //expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  it(
    'getLiquidityUsed',
    async () => {
      const res = await getLiquidityUsed(CHAIN_ID, OPTION_POOL_ADDRESS, '0');
      expect(bg(res.liquidityUsed0).toNumber()).toBeGreaterThanOrEqual(0);
      expect(bg(res.liquidityUsed0).toNumber()).toBeLessThanOrEqual(100);
    },
    TIMEOUT
  );
  it(
    'getEstimateLiquidityUsed',
    async () => {
      const res = await getEstimatedLiquidityUsed(
        CHAIN_ID,
        OPTION_POOL_ADDRESS,
        '3',
        '0'
      );
      expect(bg(res.liquidityUsed1).toNumber()).toBeGreaterThanOrEqual(0);
      expect(bg(res.liquidityUsed1).toNumber()).toBeLessThanOrEqual(100);
    },
    TIMEOUT
  );
  it(
    'getEstimateFee',
    async () => {
      const res = await getEstimatedFee(
        CHAIN_ID,
        OPTION_POOL_ADDRESS,
        '3',
        '0'
      );
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(0.001);
      expect(bg(res).toNumber()).toBeLessThanOrEqual(10);
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getEstimateTimePrice',
    async () => {
      //const res = await getEstimatedTimePrice( CHAIN_ID, OPTION_POOL_ADDRESS, '2', '0');
      DeriEnv.set('prod')
      const res = await getEstimatedTimePrice('56', '0x6fEfdd54E0aA425F9B0E647d5BA6bF6d6f3F8Ab8', '1', '8');
      DeriEnv.set('dev')
      expect(res).toEqual('0.1')
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(MIN_NUMBER);
      expect(bg(res).toNumber()).toBeLessThanOrEqual(1000);
    },
    TIMEOUT
  );
  it(
    'getVolatility',
    async () => {
      DeriEnv.set('prod')
      const res = await getVolatility('56', '0x6fEfdd54E0aA425F9B0E647d5BA6bF6d6f3F8Ab8', '1');
      DeriEnv.set('dev')
      expect(res).toEqual({})
    },
    TIMEOUT
  );
});
