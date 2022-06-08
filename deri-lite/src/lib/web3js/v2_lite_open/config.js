import { DeriEnv } from "../shared/config/env";
import { normalizeChainId } from "../shared/utils/validate";

export const openPoolChainIds = () => {
  const configs = {
    prod: ['56'],
    dev: ['97'],
    testnet: ['97'],
  }
  const env = DeriEnv.get()
  if (Array.isArray(configs[env])) {
    return configs[env]
  } else {
    throw new Error(`-- invalid env for openPoolChainIds: ${env}`)
  }
};

export const getPoolV2LiteManagerConfig = (chainId) => {
  chainId = normalizeChainId(chainId)
  const configs = {
    prod: [
      {
        chainId: "56",
        address: "0x5e3318aeaa226dc11571f19b96240d88b64702dc",
        initialBlock: "10133599",
      },
    ],
    dev: [
      {
        chainId: "97",
        address: "0x7A55ed377361802fad1Ae3d944cDbAA3c7694757",
        initialBlock: "11034400",
      },
    ],
    testnet: [
      {
        chainId: "97",
        address: "0x7A55ed377361802fad1Ae3d944cDbAA3c7694757",
        initialBlock: "11034400",
      },
    ],
  };
  const env = DeriEnv.get();
  const res = configs[env].find((c) => c.chainId === chainId);
  if (res && res.address) {
    return res
  } else {
    throw new Error(`-- getPoolV2LiteManagerConfig: cannot find config with env(${env}) and chainId(${chainId})`)
  }
};

export const getOracleFactoryChainlinkConfig = (chainId) => {
  chainId = normalizeChainId(chainId)
  const configs = {
    prod: [
      {
        chainId: '56',
        address: '0x5052fa10d68F4146B66bc15fd8cCb1674B482026',
        initialBlock: '11017943',
      },
    ],
    dev: [
      {
        chainId: '97',
        address: '0xFD1f981375f95e971E8fC0756f4daAF5784e5376',
        initialBlock: '12440610',
      },
    ],
  };
  const env = DeriEnv.get();
  const res = configs[env].find((c) => c.chainId === chainId);
  if (res && res.address) {
    return res
  } else {
    throw new Error(`-- getOracleFactoryChainlinkConfig: cannot find config with env(${env}) and chainId(${chainId})`)
  }
};


export const expandPoolConfigV2LiteOpen = (config) => {
  const pools = config.pools;
  return pools
    .map((pool) => {
      let result = [];
      for (let i = 0; i < pool.symbols.length; i++) {
        const symbol = pool.symbols[i];
        result.push({
          pool: pool.pool,
          pToken: pool.pToken,
          lToken: pool.lToken,
          initialBlock: pool.initialBlock,
          chainId: pool.chainId,
          bToken: pool.bToken,
          bTokenSymbol: pool.bTokenSymbol,
          symbol: symbol.symbol,
          symbolId: symbol.symbolId,
          offchainSymbolIds: pool.offchainSymbolIds,
          offchainSymbols: pool.offchainSymbols,
          unit: symbol.unit,
          version: 'v2_lite_open',
          isOpen: true,
        });
      }
      return result;
    })
    .flat();
};