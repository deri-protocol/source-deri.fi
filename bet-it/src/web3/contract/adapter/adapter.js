import { bg, fromWei } from "../../utils/bignumber";
import { MAX_UINT256 } from "../../utils/constant";
import { deriSymbolScaleIn, deriSymbolScaleOut, normalizeDeriSymbol } from "../../utils/symbol";
import { getBlockInfo } from "../../utils/web3";
import { classAdapter, overrideMethods, processMethod } from "./shared";

export const ERC20Adapter = (klass) => {
  klass = classAdapter(
    klass,
    "isUnlocked",
    async function (accountAddress, poolAddress) {
      const allowance = await this.allowance(accountAddress, poolAddress);
      // const res = bg(allowance).gt(0);
      // return res;
      return {
        isUnlocked: bg(allowance).gt(bg(MAX_UINT256).div(10)),
        isZero: bg(allowance).eq(0),
        allowance,
      };
    }
  );
  klass = classAdapter(
    klass,
    "unlock",
    async function (accountAddress, poolAddress, opts) {
      return await this._transact(
        "approve",
        [poolAddress, MAX_UINT256],
        accountAddress,
        opts,
      );
    }
  );
  //klass = overrideMethods(klass, [[processMethod, "balanceOf"]]);
  return klass;
};

export const symbolManagerImplementationAdapter = (klass) => {
  // klass = processMethod(klass, 'symbol', []);
  klass = classAdapter(
    klass,
    'formatTradeEvent',
    async function (event, symbols, accountAddress) {
      const info = event.returnValues;
      const tradeVolume = fromWei(info.tradeVolume);
      const block = await getBlockInfo(this.chainId, event.blockNumber);
      const symbolId = info.symbolId;
      const symbol = symbols.find((s) => s.symbolId === symbolId);
      const tradeFee = info.tradeFee;
      //const trader = await this.pToken.getOwnerOf(info.pTokenId)

      const direction =
        tradeFee !== '-1'
          ? bg(tradeVolume).gt(0)
            ? 'LONG'
            : 'SHORT'
          : 'LIQUIDATION';
      const price = bg(info.tradeCost).div(info.tradeVolume).toString();
      const notional = bg(tradeVolume).abs().times(price).toString();

      const res = {
        symbolId: info.symbolId,
        symbol: symbol.symbol,
        displaySymbol: normalizeDeriSymbol(symbol.symbol),
        trader: accountAddress,
        pTokenId: info.pTokenId,
        direction,
        volume: deriSymbolScaleOut(symbol.symbol, bg(tradeVolume).abs()),
        price: deriSymbolScaleIn(symbol.symbol, price),
        indexPrice: fromWei(info.indexPrice).toString(),
        notional: notional,
        transactionFee: tradeFee === '-1' ? '0' : fromWei(tradeFee).toString(),
        transactionHash: event.transactionHash,
        time: block.timestamp * 1000,
        extra: {},
      };
      return res;
    }
  );
  klass = overrideMethods(klass, [[processMethod, 'initialMarginRequired']]);
  return klass;
};

export const brokerImplementationAdapter = (klass) => {
  klass = overrideMethods(klass, [
    [processMethod, "bets", ['volume']]
  ])
  return klass
}