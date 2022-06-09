
export const chainConfigList = [
  { chainId: '1', name: 'ethereum', unit: 'eth' },
  { chainId: '3', name: 'ropsten', unit: 'eth' },
  //{ chainId: '42', name: 'kovan', unit: 'eth' },
  { chainId: '56', name: 'bsc', unit: 'bnb' },
  { chainId: '97', name: 'bsctestnet', unit: 'bnb' },
  { chainId: '128', name: 'heco', unit: 'ht' },
  { chainId: '256', name: 'hecotestnet', unit: 'ht' },
  { chainId: '137', name: 'polygon', unit: 'matic' },
  { chainId: '80001', name: 'mumbai', unit: 'matic' },
  { chainId: '42161', name: 'arbitrum', unit: 'eth' },
  { chainId: '421611', name: 'arbitrumtestnet', unit: 'areth' },
];


export const getChainIds = () => {
  return chainConfigList.map((c) => c.chainId);
};

const infuraAccount = "ec73e2f0c79a42c0997ee535364de584"
export const getChainProviderUrls = (chainId) => {
  const chainProviderUrls = [
    {
      provider_urls: [`https://mainnet.infura.io/v3/${infuraAccount}`],
      chainId: '1',
    },
    {
      provider_urls: [
        'https://bsc-dataseed.binance.org',
        // // 'https://bsc-dataseed1.defibit.io/',
        'https://bsc-dataseed1.ninicoin.io/',
        // 'https://aged-twilight-bush.bsc.quiknode.pro/3340cfe0b99bc659b2d1929df8b0a315d0ff240f/',
      ],
      chainId: '56',
    },
    {
      provider_urls: ['https://http-mainnet.hecochain.com'],
      chainId: '128',
    },
    {
      provider_urls: [
        'https://polygon-rpc.com',
        // 'https://rpc-mainnet.matic.network',
        'https://rpc-mainnet.maticvigil.com',
        // 'https://rpc-mainnet.matic.quiknode.pro',
        // 'https://matic-mainnet.chainstacklabs.com',
        // 'https://matic-mainnet-full-rpc.bwarelabs.com',
        // 'https://matic-mainnet-archive-rpc.bwarelabs.com',
      ],
      chainId: '137',
    },
    {
      provider_urls: [`https://ropsten.infura.io/v3/${infuraAccount}`],
      chainId: '3',
    },
    {
      provider_urls: [`https://kovan.infura.io/v3/${infuraAccount}`],
      chainId: '42',
    },
    {
      provider_urls: [
        'https://data-seed-prebsc-1-s1.binance.org:8545/',
        'https://data-seed-prebsc-1-s2.binance.org:8545/',
        // 'https://data-seed-prebsc-1-s3.binance.org:8545/',
        // 'https://data-seed-prebsc-2-s1.binance.org:8545/',
        'https://data-seed-prebsc-2-s2.binance.org:8545/',
        'https://data-seed-prebsc-2-s3.binance.org:8545/',
      ],
      chainId: '97',
    },
    {
      provider_urls: ['https://http-testnet.hecochain.com'],
      chainId: '256',
    },
    {
      provider_urls: [
        'https://rpc-mumbai.matic.today',
        'https://rpc-mumbai.maticvigil.com',
        'https://matic-mumbai.chainstacklabs.com',
        'https://matic-testnet-archive-rpc.bwarelabs.com',
      ],
      chainId: '80001',
    },
    {
      provider_urls: [
        "https://arb1.arbitrum.io/rpc",
        // "https://rpc.ankr.com/arbitrum",
        // 'https://broken-hidden-darkness.arbitrum-mainnet.quiknode.pro/991620959adc0bcb294a6225d79917cd311040f4/',
      ],
      chainId: '42161',
    },
    {
      provider_urls: [
        "https://rinkeby.arbitrum.io/rpc",
      ],
      chainId: '421611',
    },
  ];

  const res = chainProviderUrls.find((i) => i.chainId  === chainId)
  //console.log('res',res)
  if (res) {
    return res.provider_urls
  }
  throw new Error('CONFIG_NOT_FOUND', {
    name: 'getChainProviderUrls',
    args: [chainId],
  });
}

export const getDailyBlockNumberConfig = () => {
  // compute matic aunual block number: block height(16309458, 10000000)
  let chainBlockNumberList = [
    '6486',
    '6486',
    '28759',
    '28759',
    '28798',
    '28798',
    '40405',
    '40405',
  ];
  return getChainIds().reduce((accum, i, index) => {
    accum[i] = chainBlockNumberList[index];
    return accum;
  }, {});
};

// MAX UINT/INT256
// hex(2**256-1)
export const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
// hex((2**256-1) // 10**18)
export const MAX_UINT256_DIV_ONE =
  '0x12725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f21';
// hex((2**255 -1) // 10**18)
export const MAX_INT256 =
  '0x9392ee8e921d5d073aff322e62439fcf32d7f344649470f90';

