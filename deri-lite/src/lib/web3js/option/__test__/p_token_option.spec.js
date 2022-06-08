import {
  CHAIN_ID,
  OPTION_POOL_ADDRESS,
  OPTION_PTOKEN_ADDRESS,
  TIMEOUT,
  ACCOUNT_ADDRESS,
  MID_NUMBER,
  MAX_NUMBER,
  MIN_NUMBER,
} from '../../shared/__test__/setup';
import { pTokenOptionFactory } from '../factory/tokens';
import { bg } from '../../shared';

describe('PTokenOption', () => {
  let pTokenOption;
  beforeAll(() => {
    pTokenOption = pTokenOptionFactory(CHAIN_ID, OPTION_PTOKEN_ADDRESS);
  });
  it(
    'name',
    async () => {
      expect(await pTokenOption.name()).toEqual('Deri Option Position Token');
    },
    TIMEOUT
  );
  it(
    'pool',
    async () => {
      expect(await pTokenOption.pool()).toEqual(OPTION_POOL_ADDRESS);
    },
    TIMEOUT
  );
  it(
    'symbol',
    async () => {
      expect(await pTokenOption.symbol()).toEqual('DOPT');
    },
    TIMEOUT
  );
  it(
    'totalSupply',
    async () => {
      const res = await pTokenOption.totalSupply();
      expect(bg(res).toNumber()).toBeGreaterThan(MID_NUMBER);
      expect(bg(res).toNumber()).toBeLessThan(MAX_NUMBER);
    },
    TIMEOUT
  );
  it(
    'balanceOf',
    async () => {
      const res = await pTokenOption.balanceOf(ACCOUNT_ADDRESS);
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(MIN_NUMBER);
      expect(bg(res).toNumber()).toBeLessThan(MAX_NUMBER);
    },
    TIMEOUT
  );
  it(
    'getActiveSymbolIds',
    async () => {
      const res = await pTokenOption.getActiveSymbolIds(ACCOUNT_ADDRESS);
      const output = [
        '0',
        '1',
        '2',
        '3',
      ];
      expect(res).toEqual(output);
    },
    TIMEOUT
  );
  it(
    'getMargin',
    async () => {
      const res = await pTokenOption.getMargin(ACCOUNT_ADDRESS);
      expect(bg(res).toNumber()).toBeGreaterThanOrEqual(MIN_NUMBER);
      expect(bg(res).toNumber()).toBeLessThanOrEqual(MAX_NUMBER);
    },
    TIMEOUT
  );
  it(
    'getPosition',
    async () => {
      const res = await pTokenOption.getPosition(ACCOUNT_ADDRESS, '0');
      expect(res).toEqual(
        expect.objectContaining({
          cost: expect.any(String),
          lastCumulativePremiumFundingRate: expect.any(String),
          volume: expect.any(String),
        })
      );
      expect(bg(res.volume).toNumber()).toBeGreaterThanOrEqual(-10);
    },
    TIMEOUT
  );
});
