import { Env } from "../shared/config/env.js";
import { makeGetConfig, makeGetConfigList } from "../shared/utils/config.js";

const configs = {
  [Env.PROD]: [
    {
      pool: "0x3465A2a1D7523DAF811B1abE63bD9aE36D2753e0",
      initialBlock: "9514401",
      chainId: "56",
    },
    {
      pool: "0x1a9b1B83C4592B9F315E933dF042F53D3e7E4819",
      initialBlock: "9514895",
      chainId: "56",
    },
    {
      pool: "0xb144cCe7992f792a7C41C2a341878B28b8A11984",
      initialBlock: "17129838",
      chainId: "137",
    },
    {
      pool: "0xa4eDe2C4CB210CD07DaFbCe56dA8d36b7d688cd0",
      initialBlock: "17131129",
      chainId: "137",
    },
  ],
  [Env.TESTNET]: [
    {
      chainId: "97",
      pool: "0x43701b4bf0430DeCFA41210327fE67Bf4651604C",
      initialBlock: "",
    },
  ],
  [Env.DEV]: [
    {
      pool: "0x6832DFE1359c158a15E50b31B97b3BCD9cb12701",
      initialBlock: "12238607",
      chainId: "97",
    },
  ],
}; 

export const getConfigList = makeGetConfigList(configs, 'v2_lite')
export const getConfig = makeGetConfig(configs, 'v2_lite')
