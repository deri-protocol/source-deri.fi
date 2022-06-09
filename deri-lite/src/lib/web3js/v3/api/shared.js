import { isOptionSymbol, onChainSymbols } from "../config";
import { getSymbolsOracleInfo } from "../utils/oracle";

export const sendTxWithOracleSignature = async (
  chainId,
  symbol,
  symbols,
  fn,
  args
) => {
  const opts = args.pop()
  // will change latest
  // let newArgs
  // if (chainId === '421611') {
  //   newArgs = [...args, [], opts];
  // } else {
  const newArgs = [...args, await getSymbolsOracleInfo(chainId, symbols), opts];
  // }
  return await fn(...newArgs);
};
