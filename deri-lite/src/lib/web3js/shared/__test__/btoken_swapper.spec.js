import { bTokenOracle1Factory, bTokenSwapper1Factory, pancakePairFactory } from "../contract/factory"
import { TIMEOUT } from "./setup"
import { bg } from '../utils'
import { bTokenAbi } from "../contract/abis";

describe('bToken swapper', () => {
  // it('getBTokenPrice', async() => {
  //   const chainId = '56'
  //   const bTokenOracleAddress = '0xd8497754Bd7581C3f3AD8E41841608Ce7261cDb1'
  //   const bTokenOracle = bTokenOracle1Factory(chainId, bTokenOracleAddress)

  //   const [
  //     isQuoteToken0,
  //     qDecimals,
  //     bDecimals,
  //     pair,
  //     priceCumulativeLast1,
  //     priceCumulativeLast2,
  //     timestampLast1,
  //     timestampLast2,
  //   ] = await Promise.all([
  //     bTokenOracle.isQuoteToken0(),
  //     bTokenOracle.qDecimals(),
  //     bTokenOracle.bDecimals(),
  //     bTokenOracle.pair(),
  //     bTokenOracle.priceCumulativeLast1(),
  //     bTokenOracle.priceCumulativeLast2(),
  //     bTokenOracle.timestampLast1(),
  //     bTokenOracle.timestampLast2(),
  //   ]);

  //   //expect({isQuoteToken0, qDecimals, bDecimals, pair}).toEqual({})
  //   const pancakePair = pancakePairFactory(chainId, pair)
  //   let reserveQ, reserveB, timestamp
  //   if (isQuoteToken0) {
  //     const res = await pancakePair.getReserves();
  //     reserveQ = res._reserve0
  //     reserveB = res._reserve1
  //     timestamp = res._blockTimestampLast
  //   } else {
  //     const res = await pancakePair.getReserves();
  //     reserveB = res._reserve0
  //     reserveQ = res._reserve1
  //     timestamp = res._blockTimestampLast
  //   }
  //   const [price0CumulativeLast, price1CumulativeLast] = await Promise.all([
  //     pancakePair.price0CumulativeLast(),
  //     pancakePair.price1CumulativeLast(),
  //   ])
  //   let tmpPairState = {}

  //   if (timestamp !== timestampLast2) {
  //     tmpPairState.priceCumulativeLast1 = priceCumulativeLast2;
  //     tmpPairState.timestampLast1 = timestampLast2;
  //     tmpPairState.priceCumulativeLast2 = isQuoteToken0
  //       ? price0CumulativeLast
  //       : price1CumulativeLast;
  //     tmpPairState.timestampLast2 = timestamp;
  //   } else {
  //     tmpPairState = {
  //       priceCumulativeLast1,
  //       priceCumulativeLast2,
  //       timestampLast1,
  //       timestampLast2,
  //     };
  //   }

  //   let price
  //   const diff = bg(qDecimals).minus(bDecimals)
  //   if (tmpPairState.timestampLast1 !== '0') {
  //     //console.log('not equal')
  //     price = bg(tmpPairState.priceCumulativeLast2)
  //       .minus(tmpPairState.priceCumulativeLast1)
  //       .div(
  //         bg(tmpPairState.timestampLast2).minus(tmpPairState.timestampLast1)
  //       ).times(bg(10).pow(diff)).div(bg(2).pow(112));
  //   } else {
  //     //console.log('equal')
  //     price = bg(reserveB).times(bg(10).pow(diff)).div(reserveQ).toString()
  //   }

  //   expect(price).toEqual('');
  // }, TIMEOUT)
  it(
    'getBTokenPrice',
    async () => {
      const chainId = '56';
      const bTokenOracleAddress = '0xd8497754Bd7581C3f3AD8E41841608Ce7261cDb1';
      const bTokenOracle = bTokenOracle1Factory(chainId, bTokenOracleAddress)
      expect(await bTokenOracle.getPrice()).toEqual('');
    },
    TIMEOUT
  );
})