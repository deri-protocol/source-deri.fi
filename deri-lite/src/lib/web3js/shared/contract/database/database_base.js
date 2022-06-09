import Web3 from 'web3';
import { getDBProviderUrls } from '../../config/database';
import { getLatestRPCServer } from '../../utils';
import { ContractBase } from '../contract_base';

const awaitMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const dbWeb3 = (() => {
  let web3 = null
  let providerUrl = ''
  let pending = false
  return {
    async get() {
      if (web3) {
        return [web3, providerUrl];
      }
      try {
        if (pending) {
          let retry = 6 + Math.ceil(Math.random() * 4)
          while(retry > 0) {
            if (web3 && providerUrl) {
              return [web3, providerUrl]
            }
            await awaitMs(500)
            retry = retry - 1
          }
          providerUrl = await getLatestRPCServer(getDBProviderUrls());
          web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
          return [web3, providerUrl];
        } else {
          pending = true
          providerUrl = await getLatestRPCServer(getDBProviderUrls());
          web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
          return [web3, providerUrl];
        }
      } catch (err) {
        console.log(err);
      } finally {
        pending = false
      }
    },
    empty() {
      if (web3) {
        web3 = null
      }
    }
  }
})()

export class DatabaseBaseContract extends ContractBase {
  constructor(contractAddress, contractAbi) {
    super('97', contractAddress, contractAbi);
    this.providerUrl = '';
  }

  async _init() {
    // re-init web3 and contract when web3 instance is null
    if (!this.web3) {
      if (this.providerUrl) {
        dbWeb3.empty()
      }
      [this.web3, this.providerUrl] = await dbWeb3.get()
      this.contract = new this.web3.eth.Contract(
        this.contractAbi,
        this.contractAddress
      );
    }
  }

  async getValues(keyArray) {
    // console.log('keyArray', keyArray)
    return await this._call('getValues', [keyArray])
  }
}