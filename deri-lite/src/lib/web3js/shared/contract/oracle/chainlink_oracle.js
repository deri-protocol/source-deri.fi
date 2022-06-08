import { ContractBase } from "../contract_base";
import { chainlinkOracleAbi } from '../abis';
import { bg } from "../../utils";

export class ChainlinkOracle extends ContractBase {
  constructor(chainId, address, symbol, decimal='18') {
    super(chainId, address, chainlinkOracleAbi)
    this.symbol = symbol
    this.decimal = decimal
  }

  // decimals refers https://docs.chain.link/docs/matic-addresses
  async getPrice() {
    const res = await this._call('latestRoundData');
    if (res && res.answer) {
      return bg(res.answer, `-${this.decimal}`).toString()
    }
  }
}