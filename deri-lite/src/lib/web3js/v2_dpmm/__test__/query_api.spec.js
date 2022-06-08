import {
  getEstimatedFee,
  getEstimatedFundingRate,
  getEstimatedLiquidityUsed,
  getEstimatedMargin,
  getFundingRate,
  getLiquidityInfo,
  getLiquidityUsed,
  getPositionInfo,
  getPositionInfos,
  getSpecification,
  getWalletBalance,
  getPoolBTokensBySymbolId,
  isUnlocked,
  getFundingFee,
  getEstimatedTimePrice,
} from '../api/query_api';

const TIMEOUT = 50000;
const chainId = '97';
const pool = '0x520b3df50C0E08B3A3cEbd6f7a47A133E5F574C0';
const account = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF';

describe('query api', () => {
  it(
    'getLiquidityInfo',
    async () => {
      //const res = await getLiquidityInfo(chainId, pool, account, '0');
      const res = await getLiquidityInfo(
        '56',
        '0x4B439ABCBc736837D0F7f7A9C5619bF8fa650e15',
        '0x3645509F2c495d0b5F971472217c164985f67646',
        '1'
      );
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getSpecification',
    async () => {
      const res = await getSpecification(chainId, pool, '0');
      expect(res).toEqual({});
    },
    TIMEOUT
  );
  it(
    'getPositionInfo',
    async () => {
      const res = await getPositionInfo(chainId, pool, account, '0');
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
      const res = await getWalletBalance(chainId, pool, account, '0');
      expect(res).toEqual('99200');
      expect(await getWalletBalance(chainId, pool, account, '1')).toEqual('0');
    },
    TIMEOUT
  );
  it(
    'isUnlocked',
    async () => {
      expect(await isUnlocked(chainId, pool, account, '0')).toEqual(true);
      expect(await isUnlocked(chainId, pool, account, '1')).toEqual(false);
    },
    TIMEOUT
  );
  it(
    'getEstimatedMargin',
    async () => {
      expect(
        await getEstimatedMargin(chainId, pool, account, '3', '1.5', '0')
      ).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedFee',
    async () => {
      expect(await getEstimatedFee(chainId, pool, '3', '1')).toEqual(
        ''
      );
    },
    TIMEOUT
  );
  it(
    'getFundingRate',
    async () => {
      expect(await getFundingRate(chainId, pool, '0')).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedFundingRate',
    async () => {
      expect(await getEstimatedFundingRate(chainId, pool, '-100', '0')).toEqual(
        ''
      );
    },
    TIMEOUT
  );
  it(
    'getLiquidityUsed',
    async () => {
      expect(await getLiquidityUsed(chainId, pool)).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedLiquidityUsed',
    async () => {
      expect(
        await getEstimatedLiquidityUsed(chainId, pool, '20200', '0')
      ).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getPoolBTokensBySymbolId',
    async () => {
      expect(
        await getPoolBTokensBySymbolId(chainId, pool, account, '0')
      ).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getFundingFee',
    async () => {
      expect(
        await getFundingFee(chainId, pool, account, '0')
      ).toEqual('');
    },
    TIMEOUT
  );
  it(
    'getEstimatedTimePrice',
    async () => {
      expect(await getEstimatedTimePrice(chainId, pool, '10', '0')).toEqual('');
    },
    TIMEOUT
  );

});
