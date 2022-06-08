import {
  bg,
  toWei,
  fromWei,
  numberToHex,
  max,
  min,
  toHex,
  toNatural,
  toChecksumAddress,
  hexToString,
  hexToNumber,
  hexToNumberString,
  // getOracleUrl,
  normalizeChainId,
  normalizeAddress,
  getChainProviderUrl,
  getDailyBlockNumber,
  validateArgs,
  catchApiError,
  getEpochTimeRange,
  getBlockInfo,
  getLatestBlockNumber,
  getLastUpdatedBlockNumber,
  sortOptionSymbols,
  isEqualSet,
} from '../utils'
import { getOraclePrice, getPriceInfos } from '../utils/oracle';
import { TIMEOUT, ACCOUNT_ADDRESS, POOL_V2_ADDRESS, POOL_V2L_ADDRESS} from './setup';

describe('utils', () => {
  test('toWei()', () => {
    const input = "1"
    const output = "1000000000000000000"
    expect(toWei(input)).toEqual(output)
    expect(toWei(-1)).toEqual('-1000000000000000000')
  })
  test('fromWei()', () => {
    const input = "1120000000000000000"
    const output = "1.12"
    expect(fromWei(input)).toEqual(output)
  })
  test('numberToHex()', () => {
    const input = "17"
    const output = "0x11"
    expect(numberToHex(input)).toEqual(output)
  })
  test('max()', () => {
    const [input, output] = [[bg(11), bg(3)], bg(11)];
    expect(max(...input)).toEqual(output);
  });
  test('min()', () => {
    const [input, output] = [[bg(1000), bg('999')], bg(999)];
    expect(min(...input)).toEqual(output);
  });
  test('toNatural()', () => {
    const [input, output] = ['2000.1925', '2000.19'];
    expect(toNatural(input, 2)).toEqual(output);
  });
  test('toHex()', () => {
    const [input, output] = ['197', '0xc5'];
    expect(toHex(input)).toEqual(output);
  });
  test('toChecksumAddress()', () => {
    const [input, output] = [
      '0xffe85d82409c5b9d734066c134b0c2ccdd68c4df',
      ACCOUNT_ADDRESS,
    ];
    expect(toChecksumAddress(input)).toEqual(output);
  });
  test('hexToString()', () => {
    const [input, output] = ['0x0061413032', 'aA02'];
    expect(hexToString(input)).toEqual(output);
  });
  test('hexToNumber()', () => {
    const [input, output] = ['0x001032', 4146];
    expect(hexToNumber(input)).toEqual(output);
  });
  test('hexToNumberString()', () => {
    const [input, output] = ['0x001032', '4146'];
    expect(hexToNumberString(input)).toEqual(output);
  });
  test('getOraclePrice()', async() => {
    const [input, output] = [[97, 'BTCUSD'], {priceLength: 5}];
    const res = await getOraclePrice(...input)
    expect(res.split('.')[0].length).toEqual(output.priceLength);
  }, TIMEOUT)
  test('getPriceInfos()', async() => {
    const input  = ['MBOXUSDT', 'AXSUSDT']
    const output = ['AXSUSDT', 'MBOXUSDT'];
    const res = await getPriceInfos(input);
    expect(Object.keys(res)).toEqual(output);
  }, TIMEOUT)
  test('getChainProviderUrl()', async() => {
    const input = '97'
    const res = await getChainProviderUrl(input)
    expect(res).toMatch(/data-seed-prebsc-\d-s\d\.binance\.org/);
  }, TIMEOUT)
  test('normalizeChainId()', () => {
    expect(normalizeChainId(1)).toEqual('1');
    expect(normalizeChainId('56')).toEqual('56')
    expect(normalizeChainId(128)).toEqual('128')

    function withInvalidChainId() {
      return normalizeChainId('43')
    }
    expect(withInvalidChainId).toThrow(/invalid chainId/);

    function withEmptyChainId() {
      return normalizeChainId('')
    }
    expect(withEmptyChainId).toThrow(/invalid chainId/);

    function withNullChainId() {
      return normalizeChainId()
    }
    expect(withNullChainId).toThrow(/invalid chainId/);
  })
  test('normalizeAddress()', () => {
    expect(normalizeAddress('0x2baa211d7e62593ba379df362f23e7b813d760ad')).toEqual('0x2bAa211D7E62593bA379dF362F23e7B813d760Ad');

    function withInvalidAddress() {
      return normalizeAddress('56')
    }
    expect(withInvalidAddress).toThrowError(/invalid address/);
  })
  test('getDailyBlockNumber()', () => {
    expect(getDailyBlockNumber('1')).toEqual(Math.floor(2367422/365));
    expect(getDailyBlockNumber('56')).toEqual(Math.floor(10497304/365));
    expect(getDailyBlockNumber('97')).toEqual(Math.floor(10497304/365));
  })
  test('validateArgs()', () => {
    expect(validateArgs('1')).toEqual(true);
    expect(validateArgs(1.99)).toEqual(true);
    expect(validateArgs(undefined)).toEqual(false);
  })
  test('catchApiError()', async() => {
    // async function mock
    const testFunc1 = async(num) => {
      return await (new Promise((resolve) => {
        setTimeout(() => {
          resolve(num)
        }, 100)
      }))
    }
    expect(await catchApiError(testFunc1, [123], 'testFunc1()', 0)).toEqual(123);
    // async function mock
    const testFunc2 = async() => {
      return await (new Promise((resolve, reject) => {
        setTimeout(() => {
          const res = Math.random()
          if (res > 1) {
            resolve(res)
          } else {
            reject(new Error('Hi, this is a test error'))
          }
        }, 100)
      }))
    }
    expect(await catchApiError(testFunc2, [], 'testFunc2()', 666)).toEqual(666);
  }, TIMEOUT)
  test('getEpochTimeRange', () => {
    const input = new Date('2021-06-28T01:00:00Z')
    const output = [(new Date('2021-06-28T00:00:00Z')).getTime()/1000, (new Date('2021-06-28T08:00:00Z')).getTime()/1000]
    expect(getEpochTimeRange(input)).toEqual(output)
  })
  test('getEpochTimeRange 2', () => {
    const input = new Date('2021-06-28T11:00:00Z')
    const output = [(new Date('2021-06-28T08:00:00Z')).getTime()/1000, (new Date('2021-06-28T16:00:00Z')).getTime()/1000]
    expect(getEpochTimeRange(input)).toEqual(output)
  })
  test('getEpochTimeRange 3', () => {
    const input = new Date('2021-06-28T16:00:01Z')
    const output = [(new Date('2021-06-28T16:00:00Z')).getTime()/1000, (new Date('2021-06-29T00:00:00Z')).getTime()/1000]
    expect(getEpochTimeRange(input)).toEqual(output)
  })
  test('getBlockInfo', async() => {
    const input = ['97', '10000000']
    const output= ['0x9433da9e2a6778b78fb2961995f2558da9c3e9b8871ab93e94293718c7d037be', 1624497340]
    const blockInfo = await getBlockInfo(...input)
    expect(blockInfo.hash).toEqual(output[0])
    expect(blockInfo.timestamp).toEqual(output[1])
  }, TIMEOUT)
  test('getLatestBlockNumber', async() => {
    const input = '97'
    const output= 10351162
    const blockNumber = await getLatestBlockNumber(input)
    expect(blockNumber).toBeGreaterThan(output)
  }, TIMEOUT)

  test('getLastUpdatedBlockNumber', async() => {
    const output = 10178982
    expect(await getLastUpdatedBlockNumber('97', POOL_V2_ADDRESS)).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)

  test('getLastUpdatedBlockNumber V2 lite', async() => {
    const output = 10178982
    expect(await getLastUpdatedBlockNumber('97', POOL_V2L_ADDRESS, 5)).toBeGreaterThanOrEqual(output)
  }, TIMEOUT)

  test('sortOptionSymbols', () => {
    const input = [
      {
        symbol: 'BTCUSD-20000-C',
      },
      {
        symbol: 'BTCUSD-30000-C',
      },
      {
        symbol: 'BTCUSD-40000-C',
      },
      {
        symbol: 'BTCUSD-20000-P',
      },
      {
        symbol: 'BTCUSD-30000-P',
      },
      {
        symbol: 'BTCUSD-40000-P',
      },
      {
        symbol: 'ETHUSD-1500-C',
      },
      {
        symbol: 'ETHUSD-2000-C',
      },
      {
        symbol: 'ETHUSD-2500-C',
      },
      {
        symbol: 'ETHUSD-1500-P',
      },
      {
        symbol: 'ETHUSD-2000-P',
      },
      {
        symbol: 'ETHUSD-2500-P',
      },
      {
        symbol: 'BTCUSD-50000-C',
      },
      {
        symbol: 'BTCUSD-60000-C',
      },
      {
        symbol: 'ETHUSD-3500-C',
      },
      {
        symbol: 'ETHUSD-4000-C',
      },
    ];
    const output = [
      {
        symbol: 'BTCUSD-20000-C',
      },
      {
        symbol: 'BTCUSD-30000-C',
      },
      {
        symbol: 'BTCUSD-40000-C',
      },
      {
        symbol: 'BTCUSD-50000-C',
      },
      {
        symbol: 'BTCUSD-60000-C',
      },
      {
        symbol: 'BTCUSD-20000-P',
      },
      {
        symbol: 'BTCUSD-30000-P',
      },
      {
        symbol: 'BTCUSD-40000-P',
      },
      {
        symbol: 'ETHUSD-1500-C',
      },
      {
        symbol: 'ETHUSD-2000-C',
      },
      {
        symbol: 'ETHUSD-2500-C',
      },
      {
        symbol: 'ETHUSD-3500-C',
      },
      {
        symbol: 'ETHUSD-4000-C',
      },
      {
        symbol: 'ETHUSD-1500-P',
      },
      {
        symbol: 'ETHUSD-2000-P',
      },
      {
        symbol: 'ETHUSD-2500-P',
      },
    ];
    expect(sortOptionSymbols(input)).toEqual(output)
  })
  test('isEqualSet', () => {
    const input = {
      set1: new Set(['0','1','3']),
      set2: new Set(['0','2','3']),
    }
    expect(isEqualSet(input.set1, input.set2)).toEqual(false)
    const input2 = {
      set1: new Set(['0','1','3']),
      set2: new Set(['1','3','0']),
    }
    expect(isEqualSet(input2.set1, input2.set2)).toEqual(true)
    const input3 = {
      set1: new Set(['0','3']),
      set2: new Set(['1','3','0']),
    }
    expect(isEqualSet(input3.set1, input3.set2)).toEqual(false)
  })
})
