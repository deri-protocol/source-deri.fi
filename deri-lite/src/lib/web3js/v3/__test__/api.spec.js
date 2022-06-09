import { DeriEnv, Env } from '../../shared/config';
import {
  getEstimatedFee,
  getEstimatedFundingRate,
  getEstimatedLiquidityInfo,
  getEstimatedLiquidityUsed,
  getEstimatedLpInfo,
  getEstimatedMargin,
  getEstimatedTdInfo,
  getEstimatedTimePrice,
  getFundingFee,
  getFundingRate,
  getLiquidityInfo,
  getLiquidityUsed,
  getPoolMarkPrices,
  getPositionInfo,
  getPositionInfos,
  getSpecification,
  getUserBTokensInfo,
  getUserStakeInfo,
  getVolatility,
  getWalletBalance,
  isUnlocked,
  getBTokenDiscount,
  getSimulatePnl,
  getSimulatePnls,
  getPendingReward,
  getRetiredPoolsInfo,
  getPoolOnChainApy,
  getPoolB0Info,
} from '../api/query_api';
// import { chainId } from './shared.js';

const TIMEOUT = 60000;

// const chainId = '97';
// const poolAddress = '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE';
// const accountAddress = '0xFefC938c543751babc46cc1D662B982bd1636721';
// const bTokenSymbol1 = 'CAKE';
// // const bTokenSymbol2 = 'CAKE';
// const symbol1 = 'BTCUSD-50000-C';
// // const symbol2 = 'ETHUSD-3000-P';

const chainId = '421611'
const poolAddress = '0x296A1CDdE93a99B4591486244f7442E25CA596a6'
const accountAddress = '0xed0F7c6662c5308865862EE97f289107B795C206'
const bTokenSymbol1 = 'USDC';
const bTokenSymbol2 = 'AAVE';
const symbol1 = 'BTCUSD';
const symbol2 = 'BTCUSD';



describe("api", () => {
  // it(
  //   'getUserStakeInfo',
  //   async () => {
  //     expect(
  //       await getUserStakeInfo(chainId, poolAddress, accountAddress)
  //     ).toEqual({});
  //   },
  //   TIMEOUT
  // );

  // it(
  //   'getLiquidityInfo',
  //   async () => {
  //     DeriEnv.set('prod')
  //     expect(
  //       await getLiquidityInfo(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         'ETH'
  //       )
  //     ).toEqual({});
  //   },
  //   TIMEOUT
  // );

  // it(
  //   'getEstimatedLiquidityInfo',
  //   async () => {
  //     expect(
  //       await getEstimatedLiquidityInfo(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         '10',
  //         bTokenSymbol1
  //       )
  //     ).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getSpecification',
  //   async () => {
  //     expect(
  //       await getSpecification(
  //         chainId,
  //         poolAddress,
  //         symbol1
  //       )
  //     ).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getPositionInfo',
  //   async () => {
  //     expect(
  //       await getPositionInfo(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         symbol2,
  //       )
  //     ).toEqual({});
  //   },
  //   TIMEOUT
  // );

  // it(
  //   'getPositionInfos',
  //   async () => {
  //     expect(
  //       await getPositionInfos(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getPoolMarkPrices',
  //   async () => {
  //     expect(
  //       await getPoolMarkPrices(
  //         chainId,
  //         poolAddress,
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getWalletBalance',
  //   async () => {
  //     expect(
  //       await getWalletBalance(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         bTokenSymbol1,
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'isUnlocked',
  //   async () => {
  //     expect(
  //       await isUnlocked(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         // bTokenSymbol1,
  //         'LINK'
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getEstimatedMargin',
  //   async () => {
  //     expect(
  //       await getEstimatedMargin(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         '1',
  //         '10',
  //         symbol1
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getEstimatedFee',
  //   async () => {
  //     expect(
  //       await getEstimatedFee(
  //         chainId,
  //         poolAddress,
  //         '10',
  //         symbol1
  //       )
  //     ).toEqual([]);
  //     // DeriEnv.set('prod')
  //     // expect(
  //     //   await getEstimatedFee(
  //     //     '56',
  //     //     '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E',
  //     //     '100',
  //     //    'BTCUSD-50000-C'
  //     //   )
  //     // ).toEqual([]);
  //   },
  //   TIMEOUT
  // );

    it(
      'getFundingRate',
      async () => {
        expect(
          await getFundingRate(
            chainId,
            poolAddress,
            symbol1,
          )
        ).toEqual([]);
      },
      TIMEOUT
    );

  // it(
  //   'getEstimatedFundingRate',
  //   async () => {
  //     expect(
  //       await getEstimatedFundingRate(
  //         chainId,
  //         poolAddress,
  //         "0.1",
  //         symbol1
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getLiquidityUsed',
  //   async () => {
  //     expect(
  //       await getLiquidityUsed(
  //         chainId,
  //         poolAddress,
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getEstimatedLiquidityUsed',
  //   async () => {
  //     expect(
  //       await getEstimatedLiquidityUsed(
  //         chainId,
  //         poolAddress,
  //         '1',
  //         symbol1
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getUserBTokensInfo',
  //   async () => {
  //     expect(
  //       await getUserBTokensInfo(
  //         chainId,
  //         poolAddress,
  //         // "0xFefC938c543751babc46cc1D662B982bd1636721",
  //         accountAddress,
  //         // "0x0000000000000000000000000000000000000000",
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  it(
    'getFundingFee',
    async () => {
      DeriEnv.set('prod')
      expect(
        await getFundingFee(
          chainId,
          poolAddress,
          accountAddress,
          symbol1,
        )
      ).toEqual('');
    },
    TIMEOUT
  );
  // it(
  //   'getEstimatedTimePrice',
  //   async () => {
  //     // expect(
  //     //   await getEstimatedTimePrice(
  //     //     chainId,
  //     //     poolAddress,
  //     //     '0.1',
  //     //     symbol1
  //     //   )
  //     // ).toEqual([]);

  //     DeriEnv.set('prod')
  //     expect(
  //       await getEstimatedTimePrice(
  //         '56',
  //         '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E',
  //         '2469',
  //        'ETHUSD-5000-C'
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  it(
    'getVolatility',
    async () => {
      expect(
        await getVolatility(chainId, poolAddress, symbol1)
      ).toEqual('');
    },
    TIMEOUT
  );
  // it(
  //   'getEstimatedLpInfo',
  //   async () => {
  //     expect(
  //       await getEstimatedLpInfo(
  //         chainId,
  //         poolAddress,
  //         accountAddress,
  //         'CAKE',
  //       )
  //     ).toEqual('');
  //   },
  //   TIMEOUT
  // );
  // it(
  //   'getEstimatedTdInfo',
  //   async () => {
  //     // expect(
  //     //   await getEstimatedTdInfo(
  //     //     chainId,
  //     //     poolAddress,
  //     //     accountAddress,
  //     //     'CAKE',
  //     //   )
  //     // ).toEqual('');
  //     expect(
  //       await getEstimatedTdInfo(
  //         chainId,
  //         poolAddress,
  //         '0x20FdDeAba42043577a9c781501DEF7563dC5816D',
  //         'CAKE',
  //       )
  //     ).toEqual('');
  //   },
  //   TIMEOUT
  // );
  // it('getVenusEarned', async() => {
  //   expect(
  //     await getVenusEarned(chainId, poolAddress, accountAddress, { asLp: true })
  //   ).toEqual('');
  // }, TIMEOUT)

  // ================ TODO ==================
  it('getBTokenDiscount', async() => {
    expect(
      await getBTokenDiscount(chainId, poolAddress)
    ).toEqual('');
  }, TIMEOUT)

  // it(
  //   'getSimulatePnl',
  //   async () => {
  //     DeriEnv.set('prod')
  //     expect(
  //       await getSimulatePnl(
  //         '56',
  //         '0xD2D950e338478eF7FeB092F840920B3482FcaC40',
  //        'BTC^2',
  //        '-0.01',
  //       )
  //     ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSimulatePnls future symbol",
  //   async () => {
  //     DeriEnv.set("prod");
  //     const res = await getSimulatePnls(
  //       "56",
  //       "0x4ad5cb09171275A4F4fbCf348837c63a91ffaB04",
  //       "ETHUSD"
  //     );
  //     console.log(JSON.stringify(res));
  //     expect(res).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSimulatePnls power symbol",
  //   async () => {
  //     DeriEnv.set("prod");
  //     const res = await getSimulatePnls(
  //       "56",
  //       "0xD2D950e338478eF7FeB092F840920B3482FcaC40",
  //       "BTC^2"
  //     );
  //     console.log(JSON.stringify(res));
  //     expect(res).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSimulatePnls option symbol",
  //   async () => {
  //     DeriEnv.set("prod");
  //     const res = await getSimulatePnls(
  //       "56",
  //       "0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E",
  //       "ETHUSD-4000-C"
  //     );
  //     console.log(JSON.stringify(res));
  //     expect(res).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSimulatePnls arbi",
  //   async () => {
  //     DeriEnv.set("prod");
  //     const res = await getSimulatePnls(
  //       chainId,
  //       poolAddress,
  //       'ETH^2'
  //     );
  //     console.log(JSON.stringify(res));
  //     expect(res).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it('getReward', async () => {
  //   const res = await getPendingReward('97', '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE', "0xFefC938c543751babc46cc1D662B982bd1636721")
  //   expect(res).toEqual('')
  // })
  // it('getReward in prod', async () => {
  //   DeriEnv.set('prod')
  //   const res = await getPendingReward('56', '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E', "0xFefC938c543751babc46cc1D662B982bd1636721")
  //   expect(res).toEqual('')
  //   DeriEnv.set('dev')
  // })

  // it(
  //   'getRetiredPoolsInfo',
  //   async () => {
  //     DeriEnv.set(Env.PROD)
  //     expect(
  //       await getRetiredPoolsInfo(
  //         '56',
  //         accountAddress,
  //       )
  //     ).toEqual([]);
  //     // expect(
  //     //   await getPositionInfos(
  //     //     chainId,
  //     //     '0x265d9501724E8CFa18Ff935A1a37f18DBc05bCF6',
  //     //     '0xFefC938c543751babc46cc1D662B982bd1636721',
  //     //   )
  //     // ).toEqual([]);
  //   },
  //   TIMEOUT
  // );
  // it('getReward in prod', async () => {
  //   DeriEnv.set('prod')
  //   const res = await getPendingReward('56', '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E', "0xFefC938c543751babc46cc1D662B982bd1636721")
  //   expect(res).toEqual('')
  //   DeriEnv.set('dev')
  // }, TIMEOUT)
  // it('getPoolOnChainApy', async () => {
  //   DeriEnv.set('dev')
  //   const res = await getPoolOnChainApy('97', '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE')
  //   expect(res).toEqual({})
  // }, TIMEOUT)

});
