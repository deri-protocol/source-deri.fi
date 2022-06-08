//import { isUnlocked } from '../api/contractQueryApi';
import { TIMEOUT, ACCOUNT_ADDRESS, POOL_V1_ADDRESS, OPTION_POOL_ADDRESS, CHAIN_ID, POOL_V2_ADDRESS, POOL_V2L_ADDRESS } from '../shared/__test__/setup';
import { bg } from '../shared/utils';
import { getLiquidityInfo, isUnlocked } from '../indexV2';
import { getContractAddressConfig, getPoolConfigList, getPositionInfos, getSpecification, getPositionInfo, getLiquidityUsed, getEstimatedTimePrice, getEstimatedLiquidatePrice } from '../api_wrapper';
import { DeriEnv } from '../shared';

describe('api', () => {
  test('isUnlocked()', async () => {
    const output = true
    const res = await isUnlocked('97', POOL_V1_ADDRESS, ACCOUNT_ADDRESS)
    expect(res).toEqual(output);
  }, TIMEOUT);
  it('getLiquidityInfo for v2_lite', async() => {
    const res = await getLiquidityInfo('97', POOL_V1_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF')
    expect(res).toHaveProperty('totalSupply');
    expect(res).toHaveProperty('poolLiquidity');
    expect(res).toHaveProperty('shares');
    expect(res).toHaveProperty('shareValue');
    expect(res).toHaveProperty('maxRemovableShares');
    expect(bg(res.totalSupply).toNumber()).toBeGreaterThan(100);
  }, TIMEOUT );
  it('getPoolConfigList v2_lite_open', () => {
    const configList = getContractAddressConfig('prod', 'v2_lite_open')
    expect(configList.length).toEqual(2)
    expect(configList[0]).toEqual({})
  })
  it('getLiquidityInfo for option', async() => {
    const res = await getLiquidityInfo('97', OPTION_POOL_ADDRESS, '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF')
    expect(res).toHaveProperty('totalSupply');
    expect(res).toHaveProperty('poolLiquidity');
    expect(res).toHaveProperty('shares');
    expect(res).toHaveProperty('shareValue');
    expect(res).toHaveProperty('maxRemovableShares');
    expect(res).toEqual({});
    expect(bg(res.totalSupply).toNumber()).toBeGreaterThan(100);
  }, TIMEOUT );
  it('getPoolConfigList option', () => {
    const res = getContractAddressConfig('dev', 'option')
    expect(res.length).toEqual(4)
  })
  it('getPoolConfigList all', () => {
    DeriEnv.set('prod')
    const res = getPoolConfigList()
    DeriEnv.set('dev')
    //expect(res.length).toEqual(7)
    console.log(JSON.stringify(res, null, 2))
    expect(res).toEqual({})
  })
  it('getPoolConfigList testnet', () => {
    DeriEnv.set('testnet')
    const res = getPoolConfigList()
    DeriEnv.set('dev')
    //console.log(JSON.stringify(res, null, 2))
    //expect(res.length).toEqual(7)
    expect(res).toEqual({})
  })
  it('getSpecification testnet', async() => {
    DeriEnv.set('testnet')

    const res = await getSpecification('97', '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3', '0')
    DeriEnv.set('dev')
    //expect(res.length).toEqual(7)
    expect(res).toEqual({})
  }, TIMEOUT)
  it('getLiquidityInfo testnet', async() => {
    DeriEnv.set('testnet')

    const res = await getLiquidityInfo('97', '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3', ACCOUNT_ADDRESS)
    DeriEnv.set('dev')
    //expect(res.length).toEqual(7)
    expect(res).toEqual({})
  }, TIMEOUT)
  it('getPositionInfo testnet', async () => {
    DeriEnv.set('testnet');
    const res = await getPositionInfo(
      '97',
      '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3',
      '0xFefC938c543751babc46cc1D662B982bd1636721',
      '1'
    );
    DeriEnv.set('dev');
    expect(res).toEqual({});
  });
  
  it('getPositionInfos v2', async() => {
    const res = await getPositionInfos(CHAIN_ID, POOL_V1_ADDRESS, ACCOUNT_ADDRESS)
    expect(res).toEqual([])
  }, TIMEOUT)
  it('getPositionInfos v2dpmm', async() => {
    DeriEnv.set('testnet');
    const res = await getPositionInfos(CHAIN_ID, '0x1018d827B8392afFcD72A7c8A5eED390cB0599B1', ACCOUNT_ADDRESS)
    expect(res).toEqual([])
    DeriEnv.set('dev');
  }, TIMEOUT)
  it('getPositionInfos v2l dpmm', async() => {
    DeriEnv.set('testnet');
    const res = await getPositionInfos(CHAIN_ID, '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3', ACCOUNT_ADDRESS)
    expect(res).toEqual([])
    DeriEnv.set('dev');
  }, TIMEOUT)
  it('getLiquidityInfo v2dpmm', async() => {
    DeriEnv.set('testnet');
    const res = await getLiquidityInfo(CHAIN_ID, '0x1018d827B8392afFcD72A7c8A5eED390cB0599B1', ACCOUNT_ADDRESS, '0')
    expect(res).toEqual({})
    DeriEnv.set('dev');
  }, TIMEOUT)
  it('getLiquidityInfo v2l dpmm', async() => {
    DeriEnv.set('testnet');
    const res = await getLiquidityInfo(CHAIN_ID, '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3', ACCOUNT_ADDRESS)
    expect(res).toEqual({})
    DeriEnv.set('dev');
  }, TIMEOUT)
  it('getContractAddressConfig testnet', async() => {
    DeriEnv.set('testnet')
    const res = getContractAddressConfig('testnet')
    DeriEnv.set('dev')
    expect(res).toEqual([])
  })
  it(
    'getEstimatedTimePrice',
    async () => {
    DeriEnv.set('testnet');
    expect(
      await getEstimatedTimePrice(
        CHAIN_ID,
        '0x370Bcc60B98e3000ec6349C173D5A6aca9b1a1d3',
        '-10',
        '1'
      )
    ).toEqual('');
    //expect(await getEstimatedTimePrice(CHAIN_ID, '0x1018d827B8392afFcD72A7c8A5eED390cB0599B1', '10', '0')).toEqual('');
    DeriEnv.set('dev');
    },
    TIMEOUT
  );
  it(
    'getEstimatedLiquidatePrice',
    async () => {
    DeriEnv.set('testnet');
    await getPositionInfo(
      CHAIN_ID,
      '0x1018d827B8392afFcD72A7c8A5eED390cB0599B1',
      ACCOUNT_ADDRESS,
      '0'
    );
    expect(
      await getEstimatedLiquidatePrice(
        CHAIN_ID,
        '0x1018d827B8392afFcD72A7c8A5eED390cB0599B1',
        ACCOUNT_ADDRESS,
        '-10',
        '0'
      )
    ).toEqual('');
    DeriEnv.set('dev');
    },
    TIMEOUT
  );
  // it('getContractAddressConfig v2 prod', async() => {
  //   DeriEnv.set('prod')
  //   const res = getContractAddressConfig('prod', 'v2')
  //   DeriEnv.set('dev')
  //   expect(res).toEqual([])
  // })
  // it('getContractAddressConfig option prod', async() => {
  //   DeriEnv.set('prod')
  //   const res = getContractAddressConfig('prod', 'option')
  //   DeriEnv.set('dev')
  //   expect(res).toEqual([])
  // })
  // it('getContractAddressConfig v2_lite_open prod', async() => {
  //   DeriEnv.set('prod')
  //   const res = getContractAddressConfig('prod', 'v2_lite_open')
  //   DeriEnv.set('dev')
  //   expect(res).toEqual([])
  // })
});
