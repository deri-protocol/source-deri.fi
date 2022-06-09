import { DeriEnv, Env } from "../../shared/config/env.js";
// import { stringToId } from "../utils/misc.js";
import { deriLensArbiFactory } from "../contract/factory/deri_lens.js";


// const chainId = '421611'
// // const poolAddress = '0x296A1CDdE93a99B4591486244f7442E25CA596a6'
// // const accountAddress = '0xed0F7c6662c5308865862EE97f289107B795C206'

// const deriLensAddress= "0x39096E1D96D40C6aBe70F4fdB41fbE01fa61c51B"
// const poolAddress = '0xF48D3144d632e166690E3ba2c5f45F00F571BB50'
// const accountAddress = '0xFefC938c543751babc46cc1D662B982bd1636721'
// t accountAddress = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF'
// const accountAddress = '0x91672E1e303D39A312C2E55c90F52fDCd765FAfc'


const chainId = '42161'
const deriLensAddress= "0x74F8acC86D93052557752E9D0B0c7b89b53ef100"
const poolAddress = '0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8'
const accountAddress = '0xFefC938c543751babc46cc1D662B982bd1636721'
const TIMEOUT = 30000

DeriEnv.set("prod")

describe("deri lens", () => {
  let deriLens;
  beforeAll(async () => {
    DeriEnv.set(Env.PROD);
    deriLens = deriLensArbiFactory(chainId, deriLensAddress);
  });
  it(
    "nameId",
    async () => {
      // expect(await deriLens.nameId()).toEqual(stringToId("DeriLensArbi"));
      expect(await deriLens.nameId()).toEqual('0xeeaebe1c5ebe9a427c95ba11c6b19ff4770f7db2d325f7799b59a3aa0bc207da');
    },
    TIMEOUT
  );
  // it(
  //   "getPoolInfo",
  //   async () => {
  //     const res = await deriLens.getPoolInfo(poolAddress)
  //     expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getMarketsInfo",
  //   async () => {
  //     const res = await deriLens.getMarketsInfo(poolAddress)
  //     expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSymbolsInfo",
  //   async () => {
  //     const res = await deriLens.getSymbolsInfo(poolAddress)
  //     expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getLpInfo",
  //   async () => {
  //     const res = await deriLens.getLpInfo(poolAddress, accountAddress)
  //     expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getTdInfo",
  //   async () => {
  //     const res = await deriLens.getTdInfo(poolAddress, accountAddress)
  //     expect(res).toEqual({});
  //   },
  //   TIMEOUT
  // );
  it(
    "getInfo",
    async () => {
      const res = await deriLens.getInfo(poolAddress, accountAddress);
      expect(res).toEqual({});
    },
    TIMEOUT
  );
});

