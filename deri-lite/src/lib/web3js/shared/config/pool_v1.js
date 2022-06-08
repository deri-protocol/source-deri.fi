import { DeriEnv } from '../config'
import { normalizeChainId } from '../utils/validate'

export const getPoolV1ConfigList = (env = 'dev') => {
  // production environment
  if (env === 'prod') {
    return [
      {
        pool: '0xAf081e1426f64e74117aD5F695D2A80482679DE5',
        bToken: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        pToken: '0x3c11c4990447F0AD575eBd74E8cD17bf61848A15',
        lToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        initialBlock: '7906919',
        bTokenSymbol: 'BUSD',
        symbol: 'BTCUSD',
        unit: 'BTC',
        chainId: '56',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
      {
        pool: '0x011346B81e5326904B5B76A11dECAf2c67eFFc23',
        bToken: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        pToken: '0xaE6429b4CDDDFefDB6ac702183c836B4e62Da410',
        lToken: '0xd8f78c47b0e0943B3Cb2cE1e1726472C4ddd2F98',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        initialBlock: '6753399',
        bTokenSymbol: 'BUSD',
        symbol: 'COIN',
        unit: 'COIN',
        chainId: '56',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
      {
        pool: '0xD3f5E6D1a25dA1E64EDf7cb571f9fAD17FEb623c',
        bToken: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
        pToken: '0x29Be63E854727BB3Fef77eB107B8d1c33081f989',
        lToken: '0x610b39F9ba0fF2167AEb646462473c011A431Cd7',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        initialBlock: '8005906',
        bTokenSymbol: 'DERI',
        symbol: 'iMEME',
        unit: 'iMEME',
        chainId: '56',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
      {
        pool: '0x23779AAc1e74a65F27B4840A8E41F767Ce993118',
        bToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        pToken: '0x9c6134F9e759C6812aaC102FC1a9f7cA5615fD33',
        lToken: '0x43CA6D7129d7F490d5B91B4D14D7c877D15A92dA',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        initialBlock: '12548746',
        bTokenSymbol: 'USDT',
        symbol: 'BTCUSD',
        unit: 'BTC',
        chainId: '1',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
      {
        pool: '0x96a1F15676746b9339DBc185F277618359Ac6346',
        bToken: '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a',
        pToken: '0x15aD9b67cf54037127fD986Ca3bB775f9FC4ad05',
        lToken: '0xeC27d4c53C2E29F1113A9667c0B19442df83c1f1',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        initialBlock: '12548827',
        bTokenSymbol: 'BAC',
        symbol: 'BTCUSD',
        unit: 'BTC',
        chainId: '1',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
      {
        pool: '0xBA7e183042c8796E26A5a2375927DE7B1AB99d97',
        bToken: '0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047',
        pToken: '0x732Ba556B304fd74Cd14b74ab8762A7D9f26d476',
        lToken: '0x90fE976Cbb48E0761A84DDA2974024377994a997',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0xF0bC8b772f26F8DeB46c1aebbEA7C8d502Abf3b8',
        initialBlock: '5220431',
        bTokenSymbol: 'HUSD',
        symbol: 'BTCUSD',
        unit: 'BTC',
        chainId: '128',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
        retired: true,
      },
    ];
  } else if (env === 'dev') {
    return [
      {
        pool: '0x372b640A00a0A6B73381e9363A39644a712cCc37',
        bToken: '0x4038191eFb39Fe1d21a48E061F8F14cF4981A0aF',
        pToken: '0xB9113758D771750e9E8ECb359A19689eC89AC1a5',
        lToken: '0xC727a10Be4740441BE74960296097aF39D701980',
        initialBlock: '9378545',
        bTokenSymbol: 'BUSD',
        symbol: 'BTCUSD',
        unit: 'BTC',
        chainId: '97',
        type: 'perpetual',
        version: 'v1',
        versionId: 'v1',
      },
    ];
  } else if (env === 'testnet') {
    return [];
  }
};

// export const getSlpContractAddressConfig = (env = 'dev') => {
//   if (env === 'prod') {
//     return [
//       {
//         pool: '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd',
//         bToken: '0xA3DfbF2933FF3d96177bde4928D0F5840eE55600',
//         pToken: '0x0000000000000000000000000000000000000000',
//         lToken: '0x0000000000000000000000000000000000000000',
//         dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
//         MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
//         chainId: '1',
//         bTokenSymbol: 'DERI-USDT SLP',
//         symbol: '--',
//       },
//     ];
//   }
//   console.log('getSlpContractAddressConfig(): no config for dev environment');
//   return [];
// };

// export const getClpContractAddressConfig = (env = 'dev') => {
//   if (env === 'prod') {
//     return [
//       {
//         pool:   '0x4de2Ac273aD1BBe2F5C41f986d7b3cef8383Df98',
//         bToken: '0xDc7188AC11e124B1fA650b73BA88Bf615Ef15256',
//         pToken: '0x0000000000000000000000000000000000000000',
//         lToken: '0x83b31Abc899863B8Eb06952994580CE86414156E',
//         dToken: '0x0000000000000000000000000000000000000000',
//         MiningVault: '0x0000000000000000000000000000000000000000',
//         initialBlock: '6894880',
//         chainId: '56',
//         bTokenSymbol: 'CAKE-LP',
//         symbol: '--',
//         retired: true,
//       },
//     ];
//   } else {
//     return [];
//   }
// };
// export const getClp2ContractAddressConfig = (env = 'dev') => {
//   if (env === 'prod') {
//     return [
//       {
//         pool:   '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
//         bToken: '0xDc7188AC11e124B1fA650b73BA88Bf615Ef15256',
//         pToken: '0x0000000000000000000000000000000000000000',
//         lToken: '0x0000000000000000000000000000000000000000',
//         dToken: '0x0000000000000000000000000000000000000000',
//         MiningVault: '0x0000000000000000000000000000000000000000',
//         initialBlock: '699498',
//         chainId: '56',
//         bTokenSymbol: 'CAKE-LP SYRUP',
//         symbol: '--',
//       },
//     ];
//   } else {
//     return [];
//   }
// };

export const getLpConfigList = (env = 'dev') => {
  if (env === 'prod') {
    return [
      {
        pool:   '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd',
        bToken: '0xA3DfbF2933FF3d96177bde4928D0F5840eE55600',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x0000000000000000000000000000000000000000',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        chainId: '1',
        bTokenSymbol: 'DERI-USDT SLP',
        symbol: '--',
        type: 'slp',
        isLp: true,
      },
      {
        pool:   '0x4de2Ac273aD1BBe2F5C41f986d7b3cef8383Df98',
        bToken: '0xDc7188AC11e124B1fA650b73BA88Bf615Ef15256',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x83b31Abc899863B8Eb06952994580CE86414156E',
        dToken: '0x0000000000000000000000000000000000000000',
        MiningVault: '0x0000000000000000000000000000000000000000',
        initialBlock: '6894880',
        chainId: '56',
        bTokenSymbol: 'CAKE-LP',
        symbol: '--',
        type: 'clp',
        retired: true,
        isLp: true,
      },
      {
        pool:   '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
        bToken: '0xDc7188AC11e124B1fA650b73BA88Bf615Ef15256',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x0000000000000000000000000000000000000000',
        dToken: '0x0000000000000000000000000000000000000000',
        MiningVault: '0x0000000000000000000000000000000000000000',
        initialBlock: '699498',
        chainId: '56',
        bTokenSymbol: 'CAKE-LP SYRUP',
        symbol: '--',
        type: 'clp2',
        isLp: true,
      },
    ];
  } else {
    return [];
  }
};

export const getMiningVaultRouterConfig = (chainId) => {
  const configs = [
    {
      MiningVaultRouter: '0x8d5613451Dc0592388f98d7Ab1ce5A732561936e',
      chainId: '56',
    },
  ];
  const filteredConfig = configs.filter((i) => i.chainId === chainId);
  if (filteredConfig.length > 0) {
    return filteredConfig[0].MiningVaultRouter;
  } else {
    throw new Error(
      `getMiningVaultRouterAddressConfig: no address for chainId ${chainId}`
    );
  }
};

export const getDeriConfigList= (env = 'dev') => {
  if (env === 'prod') {
    return [
      {
        Deri: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        Wormhole: '0x6874640cC849153Cb3402D193C33c416972159Ce',
        bTokenSymbol: 'DERI',
        chainId: '1',
      },
      {
        Deri: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
        Wormhole: '0x15a5969060228031266c64274a54e02Fbd924AbF',
        bTokenSymbol: 'DERI',
        chainId: '56',
      },
      {
        Deri: '0x2bdA3e331Cf735D9420e41567ab843441980C4B8',
        Wormhole: '0x134A04497e9a0b1F8850fEaf87eD18ec348dDa46',
        bTokenSymbol: 'DERI',
        chainId: '128',
      },
    ];
  }
  return [
    {
      Deri: '0x88Fe79a3b6AC7EeF3d55B2e388fa18400590698B',
      Wormhole: '0xcb28Fa7dFa1844Cdb47aD5f03484f6131293Fd2e',
      bTokenSymbol: 'DERI',
      chainId: '3',
    },
    {
      Deri: '0x8dC0aA48bbc69BaCD2548c6b7adCDeF8DDbA50B2',
      Wormhole: '0x9028e43114Df57C97c15355224E575DF1e244919',
      bTokenSymbol: 'DERI',
      chainId: '97',
    },
    {
      Deri: '0x932458a637F8060AF747167656651b64d4c36620',
      Wormhole: '0x629B0D3D32BE5ee5F7BF3845914d26446c04165d',
      bTokenSymbol: 'DERI',
      chainId: '256',
    },
  ];
};

export const getPreminingConfigList = (env = 'dev') => {
  if (env === 'prod') {
    return [
      {
        bToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0xe91cb8ba06028f38e231F7099e9B97CEDd2f2736',
        pool: '0x447A9BC67721cB115ce6E664a261568a3c8F5B35',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        chainId: '56',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/0/0/0x447A9BC67721cB115ce6E664a261568a3c8F5B35',
        bTokenSymbol: 'WBNB',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x8518054fa6b7E0d4834bfD152c9BA5BDB856FD2B',
        pool: '0xA51E3D1a0A6E9114c22728991dDFdd62a9ABd9ad',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        chainId: '56',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/0/1/0xA51E3D1a0A6E9114c22728991dDFdd62a9ABd9ad',
        bTokenSymbol: 'CAKE',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0xa184088a740c695E156F91f5cC086a06bb78b827',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x167704539C9acAcF6f0C2D7AAeB4413339F86AaA',
        pool: '0x03dA5cB10D868c5F979b277eb6DF17D50E78fE2A',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
        chainId: '56',
        staking: true,
        url:
          'https://premining.deri.finance/#/premining/0/2/0x03dA5cB10D868c5F979b277eb6DF17D50E78fE2A',
        bTokenSymbol: 'AUTO',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x43CA6D7129d7F490d5B91B4D14D7c877D15A92dA',
        pool: '0xEDBbC66fC5Ee21E97001A3E88E312457003D6BEc',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0xF0bC8b772f26F8DeB46c1aebbEA7C8d502Abf3b8',
        chainId: '128',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/1/0/0xEDBbC66fC5Ee21E97001A3E88E312457003D6BEc',
        bTokenSymbol: 'WHT',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0xeC27d4c53C2E29F1113A9667c0B19442df83c1f1',
        pool: '0x667FC1D27dC94a8c7a9ff86fc9908079DCFD6aA0',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0xF0bC8b772f26F8DeB46c1aebbEA7C8d502Abf3b8',
        chainId: '128',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/1/1/0x667FC1D27dC94a8c7a9ff86fc9908079DCFD6aA0',
        bTokenSymbol: 'MDX',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x3B50881F5646E809ef85Bb0016af3b2Ee5313d46',
        pool: '0x4847f7b81476346e5e55BBdD3b447435c5Be4a7d',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        chainId: '1',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/2/0/0x4847f7b81476346e5e55BBdD3b447435c5Be4a7d',
        bTokenSymbol: 'SUSHI',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0x0069b4Fb48e5B8E9CB6960f4c2468b625ACfb465',
        pool: '0xC773104722aA79bdA8f6ECF9384Cf7d9B70371e2',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        chainId: '1',
        staking: false,
        url:
          'https://premining.deri.finance/#/premining/2/1/0xC773104722aA79bdA8f6ECF9384Cf7d9B70371e2',
        bTokenSymbol: 'AAVE',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
      {
        bToken: '0xA3DfbF2933FF3d96177bde4928D0F5840eE55600',
        pToken: '0x0000000000000000000000000000000000000000',
        lToken: '0xFFCfB31b6500E7e420CFE5D0df710DdF928F55FD',
        pool: '0x3f98429b673AF39671a495b5B12Ebd5C10092ccB',
        dToken: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        MiningVault: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
        chainId: '1',
        staking: true,
        url:
          'https://premining.deri.finance/#/premining/2/2/0x3f98429b673AF39671a495b5B12Ebd5C10092ccB',
        bTokenSymbol: 'DERI-USDT SLP',
        isInTvlRace: false,
        retired: true,
        premining: true,
      },
    ];
  } else {
    return []
  }
};


// export const getSlpConfig = (chainId, poolAddress) => {
//   chainId = normalizeChainId(chainId);
//   const pools = getLpConfigList(DeriEnv.get()).filter(
//     (c) => c.chainId === chainId
//   );
//   const pool = pools.filter((p) => p.pool === poolAddress);
//   if (pool.length > 0) {
//     return {
//       poolAddress: pool[0].pool,
//       bTokenAddress: pool[0].bToken,
//       pTokenAddress: pool[0].pToken,
//       lTokenAddress: pool[0].lToken,
//       dTokenAdress: pool[0].dToken,
//       MinningVaultAddress: pool[0].MiningVault,
//     };
//   }
//   console.log(
//     `getSlpConfig(): contract address is not found: ${chainId} ${poolAddress}`
//   );
//   return {};
// };

// export const getClp2Config= (chainId, poolAddress) => {
//   chainId = normalizeChainId(chainId);
//   const pools = getLpContractConfigList(DeriEnv.get()).filter(
//     (c) => c.chainId === chainId
//   );
//   const pool = pools.filter((p) => p.pool === poolAddress);
//   if (pool.length > 0) {
//     return {
//       poolAddress: pool[0].pool,
//       bTokenAddress: pool[0].bToken,
//       pTokenAddress: pool[0].pToken,
//       lTokenAddress: pool[0].lToken,
//       dTokenAdress: pool[0].dToken,
//       MinningVaultAddress: pool[0].MiningVault,
//     };
//   }
//   console.log(
//     `getClp2Config(): contract address is not found: ${chainId} ${poolAddress}`
//   );
//   return {};
// };

// export const getClpConfig= (chainId, poolAddress) => {
//   chainId = normalizeChainId(chainId);
//   const pools = getLpContractConfigList(DeriEnv.get()).filter(
//     (c) => c.chainId === chainId
//   );
//   const pool = pools.filter((p) => p.pool === poolAddress);
//   if (pool.length > 0) {
//     return {
//       poolAddress: pool[0].pool,
//       bTokenAddress: pool[0].bToken,
//       lTokenAddress: pool[0].lToken,
//     };
//   }
//   console.log(
//     `getClpContractAddress(): contract address is not found: ${chainId} ${poolAddress}`
//   );
//   return {};
// };

export const getLpConfig = (chainId, poolAddress) => {
  chainId = normalizeChainId(chainId);
  const pools = getLpConfigList(DeriEnv.get()).filter(
    (c) => c.chainId === chainId
  );
  const pool = pools.filter((p) => p.pool === poolAddress);
  if (pool.length > 0) {
    return {
      poolAddress: pool[0].pool,
      bTokenAddress: pool[0].bToken,
      lTokenAddress: pool[0].lToken,
      type: pool[0].type,
    };
  }
  console.log(
    `getLpConfig(): contract address is not found: ${chainId} ${poolAddress}`
  );
  return {};
};

export const getDeriConfig= (chainId) => {
  chainId = normalizeChainId(chainId);
  const pool = getDeriConfigList(DeriEnv.get()).filter(
    (c) => c.chainId === chainId
  );
  if (pool.length > 0) {
    return {
      deriAddress: pool[0].Deri,
      wormholeAddress: pool[0].Wormhole,
      bTokenSymbol: pool[0].bTokenSymbol,
    };
  }
  console.log(
    `getDeriConfig(): contract address is not found: ${chainId}`
  );
  return {};
};

export const getMiningVaultConfig = (chainId) => {
  chainId = normalizeChainId(chainId);
  const pools = getPoolV1ConfigList(DeriEnv.get()).filter(
    (c) => c.chainId === chainId
  );
  if (pools.length > 0) {
    if (pools[0].MiningVault) {
      return pools[0].MiningVault;
    }
  }
};

export const getPoolV1Config = (chainId, poolAddress) => {
  chainId = normalizeChainId(chainId);
  const env = DeriEnv.get()
  const pools = getPoolV1ConfigList(env)
    .concat(getPreminingConfigList(env))
    .concat(getLpConfigList(env))
    .filter((c) => c.chainId === chainId);
  const pool = pools.filter((p) => p.pool === poolAddress);
  if (pool.length > 0) {
    return {
      poolAddress: pool[0].pool,
      bTokenAddress: pool[0].bToken,
      pTokenAddress: pool[0].pToken,
      lTokenAddress: pool[0].lToken,
      dTokenAdress: pool[0].dToken,
      MinningVaultAddress: pool[0].MiningVault,
      bTokenSymbol: pool[0].bTokenSymbol,
      symbol: pool[0].symbol,
      unit: pool[0].unit,
      initialBlock: pool[0].initialBlock,
    };
  } else {
    throw new Error(
      `getPoolV1Config(): contract address is not found: ${chainId} ${poolAddress}`
    );
  }
}
