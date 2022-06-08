import {
  getUserInfo,
  getUserInfoAll,
  getPoolLiquidity,
  getPoolLiquidityAll,
  getPoolInfoApy,
  getPoolInfoApyAll,
  getLpPoolInfoApy,
  getUserInfoAllForAirDrop,
  getUserInfoInPool,
} from '../api/database_api';
import { ACCOUNT_ADDRESS, TIMEOUT } from './setup';
import { bg } from '../utils';
import { DeriEnv } from '../config';

describe('database api', () => {
  it(
    'getUserInfo',
    async () => {
      const output = {
        amount: '0.326545',
        chainId: '56',
        deadline: '1625299200',
        nonce: '1625270400',
        r: '0xedebdd2c316f12d6697658d85777e760c40ff9941e1eb75838a976b926405128',
        s: '0x374dc8a1e4fb563f8dea93cf2abc889a4ba993c92bcdc44e1470bc200bd1fa65',
        v: '27',
        valid: true,
      };
      const res = await getUserInfo(ACCOUNT_ADDRESS);
      expect(res).toEqual(output);
    },
    TIMEOUT
  );
  it(
    'getUserInfoAll',
    async () => {
      const output = {
        amount: '0.326545',
        chainId: '56',
        deadline: '1625299200',
        nonce: '1625270400',
        r: '0xedebdd2c316f12d6697658d85777e760c40ff9941e1eb75838a976b926405128',
        s: '0x374dc8a1e4fb563f8dea93cf2abc889a4ba993c92bcdc44e1470bc200bd1fa65',
        v: '27',
        valid: true,
        lp: '0.027163',
        total: '10.204923',
        trade: '0',
      };
      const res = await getUserInfoAll(ACCOUNT_ADDRESS);
      expect(res).toEqual(output);
    },
    TIMEOUT
  );
  it(
    'getPoolLiquidity',
    async () => {
      const output = 1000000;
      DeriEnv.set('prod');
      const res = await getPoolLiquidity(
        '56',
        '0xD3f5E6D1a25dA1E64EDf7cb571f9fAD17FEb623c'
      );
      DeriEnv.set('dev');
      expect(bg(res.liquidity).toNumber()).toBeGreaterThanOrEqual(output);
    },
    TIMEOUT
  );
  it(
    'getPoolInfoApy',
    async () => {
      const minOutput = 0.1;
      const maxOutput = 0.8;
      DeriEnv.set('prod');
      const res = await getPoolInfoApy(
        '137',
        '0xb144cCe7992f792a7C41C2a341878B28b8A11984'
      );
      DeriEnv.set('dev');
      expect(bg(res.apy).toNumber()).toBeGreaterThanOrEqual(minOutput);
      expect(bg(res.apy).toNumber()).toBeLessThanOrEqual(maxOutput);
    },
    TIMEOUT
  );
  it(
    'getLpPoolInfoApy',
    async () => {
      const minOutput = 0.001;
      const maxOutput = 1.1;
      DeriEnv.set('prod');
      const res = await getLpPoolInfoApy(
        '56',
        '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
      );
      DeriEnv.set('dev');
      expect(bg(res.apy).toNumber()).toBeGreaterThanOrEqual(minOutput);
      expect(bg(res.apy).toNumber()).toBeLessThanOrEqual(maxOutput);
      expect(bg(res.apy2).toNumber()).toBeGreaterThanOrEqual(0);
    },
    TIMEOUT
  );
  it(
    'getUserInfoInPool',
    async () => {
      const minOutput = 0;
      const maxOutput = 0.8;
      DeriEnv.set('prod');
      const res = await getUserInfoInPool(
        '56',
        '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
        ACCOUNT_ADDRESS,
      );
      DeriEnv.set('dev');
      expect(bg(res.volume1h).toNumber()).toBeGreaterThanOrEqual(minOutput);
      expect(bg(res.volume24h).toNumber()).toBeLessThanOrEqual(maxOutput);
    },
    TIMEOUT
  );
  it(
    'getUserInfoAllForAirDrop',
    async () => {
      const output = {
        amount: '0',
        chainId: '0',
        deadline: '0',
        nonce: '0',
        r1: '0x0000000000000000000000000000000000000000000000000000000000000000',
        r2: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s1: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s2: '0x0000000000000000000000000000000000000000000000000000000000000000',
        v1: '0',
        v2: '0',
        valid: false,
      }
      DeriEnv.set('prod');
      const res = await getUserInfoAllForAirDrop(ACCOUNT_ADDRESS);
      DeriEnv.set('dev');
      expect(res).toEqual(output);
    },
    TIMEOUT
  );
  it(
    'getPoolLiquidityAll',
    async () => {
      DeriEnv.set('prod');
      const res = await getPoolLiquidityAll([
        {
          pool: '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
          version: 'v2',
          chainId: '56',
          bTokenId: '0',
        },
        {
          pool: '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
          version: 'v2',
          chainId: '56',
          bTokenId: '1',
        },
        {
          pool: '0x3465A2a1D7523DAF811B1abE63bD9aE36D2753e0',
          chainId: '56',
          version: 'v2_lite',
        },
        {
          pool: '0xD5147D3d43BB741D8f78B2578Ba8bB141A834de4',
          chainId: '56',
          version: 'option',
        },
      ]);
      DeriEnv.set('dev');
      expect(res).toEqual([]);
    },
    TIMEOUT
  );
  it(
    'getPoolInfoApyAll',
    async () => {
      DeriEnv.set('prod');
      const res = await getPoolInfoApyAll([
        {
          pool: '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
          version: 'v2',
          chainId: '56',
          bTokenId: '0',
        },
        {
          pool: '0x19c2655A0e1639B189FB0CF06e02DC0254419D92',
          version: 'v2',
          chainId: '56',
          bTokenId: '1',
        },
        {
          pool: '0x3465A2a1D7523DAF811B1abE63bD9aE36D2753e0',
          chainId: '56',
          version: 'v2_lite',
        },
        {
          pool: '0xD5147D3d43BB741D8f78B2578Ba8bB141A834de4',
          chainId: '56',
          version: 'option',
        },
      ]);
      DeriEnv.set('dev');
      expect(res).toEqual([]);
    },
    TIMEOUT
  );


});
