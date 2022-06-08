import { ContractBase } from "../contract_base";
import { wooOracleAbi } from '../abis';
import { deriToNatural } from "../../utils";

export class WooOracle extends ContractBase {
  constructor(chainId, address, symbol, decimal='18') {
    super(chainId, address, wooOracleAbi)
    this.symbol = symbol
    this.decimal = decimal
  }

  async getPrice() {
    //console.log('hit woo oracle')
    const res = await this._call('getPrice');
    if (res) {
      return deriToNatural(res).toString()
    }
  }
}
