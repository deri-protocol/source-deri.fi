import { fromWei } from "../shared";
import { getOraclePriceFromCache2, oraclePricesCache } from "../shared/utils/oracle";

export const getSymbolPrices = async (chainId, symbols, offChainSymbolIds, offChainSymbolNames) => {
  const onChainOracleAddressWithPlaceHolder = symbols.map((s) =>
    offChainSymbolIds.indexOf(s.symbolId) > -1
      ? ''
      : s.oracleAddress
  );

  const onChainSymbolPrices = await Promise.all(
    onChainOracleAddressWithPlaceHolder
      .reduce((acc, address, index) => {
        const _symbol = symbols.map((s) => s.symbol)[index];
        if (address !== '') {
          return acc.concat(
            getOraclePriceFromCache2.get(chainId, _symbol, address)
          );
        } else {
          return acc.concat('');
        }
      }, [])
      .filter((f) => f !== '')
  );

  const res =  await oraclePricesCache.get(offChainSymbolNames)
  const offChainSymbolPrices = offChainSymbolNames.map((s) => fromWei(res[s].price))

  // combine offChain and onChain symbol prices
  const symbolPrices = onChainOracleAddressWithPlaceHolder.map((o) => {
    if (o !== '') {
      return onChainSymbolPrices.shift();
    } else {
      return offChainSymbolPrices.shift();
    }
  });
  return symbolPrices
};