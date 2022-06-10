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
  const newArgs = [...args, await getSymbolsOracleInfo(chainId, symbols), opts];
  return await fn(...newArgs);
};
