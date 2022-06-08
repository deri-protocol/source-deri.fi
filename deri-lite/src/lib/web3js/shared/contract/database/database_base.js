// import Web3 from 'web3';
// import { web3Factory } from '../';
// import { getDBProviderUrls } from '../../config/database';
// import { getLatestRPCServer } from '../../utils';

// export class DatabaseBaseContract {
//   constructor(contractAddress, contractAbi) {
//     this.contractAddress = contractAddress;
//     this.contractAbi = contractAbi;
//   }
//   async _init() {
//     if (!this.web3) {
//       this.web3 = await web3Factory.get(this.chainId);
//       this.contract = new this.web3.eth.Contract(
//         this.contractAbi,
//         this.contractAddress
//       );
//     }
//     // this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerUrl));
//     // this.contract = new this.web3.eth.Contract(
//     //   this.contractAbi,
//     //   this.contractAddress
//     // );
//   }

//   async updateProviderUrl() {
//     if (!this.providerUrl) {
//       this.providerUrl = await getLatestRPCServer(getDBProviderUrls());
//       this._init();
//     }
//   }

//   async _call(method, args) {
//     let res
//     let retry = 3
//     while(retry > 0) {
//       try {
//         await this.updateProviderUrl();
//         res = await this.contract.methods[method](...args).call();
//         break
//       } catch (err) {
//         this.providerUrl = null
//         console.log(err.toString())
//       }
//       retry -= 1
//     }
//     if (retry === 0 && !res) {
//       throw new Error(`database ${method}(${args}): exceed max retry 3.`)
//     }
//     return res
//   }
// }
