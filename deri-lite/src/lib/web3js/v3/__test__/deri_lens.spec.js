import { DeriEnv } from "../../shared/config";
import { ADDRESS_ZERO } from "../../shared/config/constant";
import { deriLensFactory } from "../contract/factory/deri_lens";
import { stringToId } from "../utils/misc";

DeriEnv.set('prod')
const chainId = '56'
const poolAddress = '0xD2D950e338478eF7FeB092F840920B3482FcaC40'
const accountAddress = '0xFefC938c543751babc46cc1D662B982bd1636721'
const deriLensAddress = '0xDe80Af93fB29f58f44601dfA270777b6785D0D08'
const TIMEOUT = 30000

describe("deri lens", () => {
  let deriLens;
  beforeAll(async () => {
    deriLens = deriLensFactory(chainId, deriLensAddress);
  });
  // it(
  //   "version",
  //   async () => {
  //     expect(await deriLens.nameId()).toEqual(stringToId("DeriLens"));
  //     expect(await deriLens.versionId()).toEqual(stringToId("3.0.1"));
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getPoolInfo",
  //   async () => {
  //     const res = await deriLens.getPoolInfo(poolAddress)
  //     // expect(res).toEqual({});
  //     expect(res.keepRatioB0).toEqual('0.25');
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getMarketsInfo",
  //   async () => {
  //     const res = await deriLens.getMarketsInfo(poolAddress)
  //     // expect(res).toEqual([]);
  //     expect(res.length).toEqual(13);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getSymbolsInfo",
  //   async () => {
  //     const res = await deriLens.getSymbolsInfo(poolAddress)
  //     expect(res).toEqual([]);
  //     //expect(res.length).toEqual(20);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getLpInfo",
  //   async () => {
  //     const res = await deriLens.getLpInfo(poolAddress, accountAddress)
  //     expect(res).toEqual({});
  //     expect(res.markets.length).toEqual(4);
  //   },
  //   TIMEOUT
  // );
  // it(
  //   "getTdInfo",
  //   async () => {
  //     const res = await deriLens.getTdInfo(poolAddress, accountAddress)
  //     // expect(res).toEqual({});
  //     expect(res.markets.length).toEqual(2);
  //     expect(res.positions.length).toEqual(2);
  //   },
  //   TIMEOUT
  // );
  it(
    "getInfo",
    async () => {
      const res = await deriLens.getInfo(poolAddress, accountAddress)
      // const res = await deriLens.getInfo(poolAddress, ADDRESS_ZERO)
      expect(res).toEqual({});
      // expect(res.symbolsInfo.length).toEqual(20);
    },
    TIMEOUT
  );
});
