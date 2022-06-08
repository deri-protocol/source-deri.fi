import { DeriEnv } from "../shared/config"

export const getPTokenAirdropConfig = (chainId, env) => {
  chainId = chainId.toString()
  env = env || DeriEnv.get();
  const config = {
    prod: [
      {
        chainId: '56',
        address: '0x055FD7f825cCD1b87092A1Ee40462c4c60dDD8ba',
      },
    ],
    dev: [
      {
        chainId: '97',
        address: '0x632D0f5d642B0d915cE1ad0772677FC589cc724d',
      },
    ],
  };

  if (Object.keys(config).includes(env)) {
    const res = config[env].find((c) => c.chainId === chainId);
    if (res) {
      return res
    }
  } 
  throw new Error(`-- getPTokenAirdropConfig(), invalid env(${env}) or chainId(${chainId})`)
};

export const getDeriVoteConfig = (chainId, env) => {
  chainId = chainId.toString()
  env = env || DeriEnv.get();
  const config = {
    prod: [
      {
        chainId: '1',
        address: '0xb2b6907AdDa5a13673849CBD448f31be9C4A7424',
      },
      {
        chainId: '56',
        address: '0x27c116474D4E08df0A13935AF508E8922271F891',
      },
      {
        chainId: '128',
        address: '0x3752D67bfBe945a89787c7F6758A47C2D52988d4',
      },
      {
        chainId: '137',
        address: '0x6d05Fd927b5d184A8f848DA7D57C7228AEf80b85',
      },
    ],
    dev: [
      {
        chainId: '97',
        address: '0x37f3432B2166c6dB487c844C481Cba47ac98AD00',
      },
    ],
  };

  if (Object.keys(config).includes(env)) {
    const res = config[env].find((c) => c.chainId === chainId);
    if (res) {
      return res
    }
  } 
  throw new Error(`-- getDeriVoteConfig(): invalid env(${env}) or chainId(${chainId})`)
};

export const getStakingMiningVaultRouterConfig = (chainId='56', name='TE1') => {
  chainId = chainId.toString()
  const configs = [
    {
      chainId: '56',
      address: '0x224a441f7a4C6775009a1f506e725FE1D180950e',
      env: 'prod',
      name: 'TE1'
    },
    {
      chainId: '56',
      address: '0x386aFE3CBC562598Ae13B991f2b2198A64064aD5',
      env: 'prod',
      name: 'TE2'
    }
  ]
  const res = configs.find((c) => c.chainId === chainId && c.name === name)
  if (res) {
    return res
  } else {
    throw new Error(`-- getStakingMiningVaultRouterConfig(): invalid name(${name}) or chainId(${chainId})`)
  }
}

export const getStakingCurrencyVaultConfig = (chainId='56', name='TE2') => {
  chainId = chainId.toString()
  const configs = [
    {
      chainId: '56',
      address: '0xff5090fa6a50D5AD526460cc880fAF5c94237a34',
      env: 'prod',
      name: 'TE2'
    }
  ]
  const res = configs.find((c) => c.chainId === chainId && c.name === name)
  if (res) {
    return res
  } else {
    throw new Error(
      `-- getStakingCurrencyVaultConfig(): invalid name(${name}) or chainId(${chainId})`
    );
  }
}
