export const getDBProviderUrls = () => [
  'https://data-seed-prebsc-1-s1.binance.org:8545/',
  'https://data-seed-prebsc-1-s2.binance.org:8545/',
  'https://data-seed-prebsc-1-s3.binance.org:8545/',
  'https://data-seed-prebsc-2-s1.binance.org:8545/',
  'https://data-seed-prebsc-2-s2.binance.org:8545/',
  'https://data-seed-prebsc-2-s3.binance.org:8545/',
];

export const getDBAddress = (env = 'dev', useProductionDB) => {
  if (env === 'prod' && useProductionDB) {
    // for production
    return '0x824B6238EdCbaCCAF83C3F60C0cEB38bEb7C9e89';
  }
  // for test
  return '0x7C1267188379f57d92e640E519151229E1eA5565';
};

export const getDBWormholeAddress = (env = 'dev', useProductionDB) => {
  if (env === 'prod' && useProductionDB) {
    // for production
    return '0xd8137F05c1F432A80525053c473d0e286c4F46f0';
  }
  // for test
  return '0x3c9118C7f9f4ef0Ab5333cD710922dBCCC2d870d';
};

export const getDBAirdropAddress = (env = 'dev', useProductionDB) => {
  if (env === 'prod' && useProductionDB) {
    // for production
    return '0x35b2650eFb799DF4696b292D11b4770a0fFaa7c7';
  }
  // for test
  return '0x7C1267188379f57d92e640E519151229E1eA5565';
};
