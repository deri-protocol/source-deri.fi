import { checkAddress, DeriEnv } from '../../shared';
import {
  getLiquidityInfo,
  getSpecification,
  getPositionInfo,
  getPositionInfos,
  getWalletBalance,
  isUnlocked,
  getFundingRate,
  getEstimatedFee,
  getEstimatedMargin,
  getLiquidityUsed,
  getEstimatedLiquidityUsed,
  getEstimatedFundingRate,
  getEstimatedTimePrice,
} from '../api/query_api';
const TIMEOUT = 20000;

describe('query api', () => {
  const chainId = '97';
  const pool = '0x792ec4De2B607baEF7DAAE9d238d73Ffb4819972';
  const account = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF';
  it(
    'getLiquidityInfo',
    async () => {
      console.log(chainId, pool, account);
      const res = await getLiquidityInfo(chainId, pool, account);
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getSpecification',
    async () => {
      const res = await getSpecification(chainId, pool, '1');
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getPositionInfo',
    async () => {
      DeriEnv.set('testnet')
      //const res = await getPositionInfo('97', pool, '0xFefC938c543751babc46cc1D662B982bd1636721', '1');
      const res = await getPositionInfo(chainId, pool, account, '0');
      DeriEnv.set('dev')
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getPositionInfos',
    async () => {
      const res = await getPositionInfos(chainId, pool, account);
      expect(res).toEqual([]);
    },
    TIMEOUT
  );
  it(
    'getWalletBalance',
    async () => {
      const res = await getWalletBalance(chainId, pool, account);
      expect(res).toEqual('49800');
    },
    TIMEOUT
  );
  it(
    'isUnlocked',
    async () => {
      const res = await isUnlocked(chainId, pool, account);
      expect(res).toEqual(true);
    },
    TIMEOUT
  );
  it(
    'getFundingRate',
    async () => {
      const res = await getFundingRate(chainId, pool, '0');
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getEstimatedFundingRate',
    async () => {
      const res = await getEstimatedFundingRate(chainId, pool, '10', '0');
      expect(res).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedMargin',
    async () => {
      const res = await getEstimatedMargin(
        chainId,
        pool,
        account,
        '7',
        '7.1',
        '1'
      );
      expect(res).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedFee',
    async () => {
      const res = await getEstimatedFee(chainId, pool, '7', '0');
      expect(res).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getLiquidityUsed',
    async () => {
      const res = await getLiquidityUsed(chainId, pool, '0');
      expect(res).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedLiquidityUsed',
    async () => {
      const res = await getEstimatedLiquidityUsed(chainId, pool, '1000', '0');
      expect(res).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedTimePrice',
    async () => {
      const res = await getEstimatedTimePrice(chainId, pool, '1', '1');
      expect(res).toEqual('');
    },
    TIMEOUT
  );
});
