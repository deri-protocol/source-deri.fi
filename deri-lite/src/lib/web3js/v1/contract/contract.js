import Web3 from 'web3';
import { metaMaskWeb3, web3Factory } from '../factory_old/web3';

const MAX_GAS_AMOUNT = 532731;

export class Contract {
  constructor(chainId, contractAddress, contractAbi, isProvider) {
    this.chainId = chainId;
    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
    this.isProvider = isProvider;
  }
  async _init() {
    if (!this.web3) {
      if (this.isProvider) {
        this.web3 = await web3Factory(this.chainId);
      } else {
        this.web3 = metaMaskWeb3();
      }
      this.contract = new this.web3.eth.Contract(
        this.contractAbi,
        this.contractAddress
      );
    }
  }

  setAccount(accountAddress) {
    this.accountAddress = accountAddress;
    return this;
  }
  setPool(poolAddress) {
    this.poolAddress = poolAddress;
    return this;
  }
  async _call(method, args = []) {
    let res
    let retry = 2
    while(retry > 0) {
      try {
        await this._init()
        res = await this.contract.methods[method](...args).call();
        break
      } catch(err) {
        retry -= 1
        this.web3 = null
        if (err.toString().includes('Invalid JSON RPC response')) {
          console.log(`Invalid JSON RPC response with chainId(${this.chainId})`);
        } else if (err.toString().includes("Returned values aren't valid,")) {
          console.log(`Invalid contract address(${this.contractAddress}) and chainId(${this.chainId})`);
        } else {
          console.log(err)
        }
      }
    }
    if (retry === 0 && !res) {
      throw new Error(`The contract(${this.contractAddress}) '${method}(${args})' failed with max retry 2.`)
    }
    return res
  }

  async _estimatedGas(method, args = [], accountAddress) {
    let gas = 0;
    for (let i = 0; i < 2; i++) {
      try {
        gas = await this.contract.methods[method](...args).estimateGas({
          from: accountAddress,
        });
        gas = parseInt(gas * 1.25);
        break;
      } catch (err) {
        //console.log("err", err);
      }
    }
    if (gas == 0) gas = MAX_GAS_AMOUNT;
    if (gas > MAX_GAS_AMOUNT) gas = MAX_GAS_AMOUNT;
    return gas;
  }

  _getTransactionReceipt(tx) {
    const self = this;
    return function _transactionReceipt(resolve, reject) {
      self.web3.eth.getTransactionReceipt(tx, (error, receipt) => {
        if (error) {
          reject(error);
        } else if (receipt === null) {
          setTimeout(() => _transactionReceipt(resolve, reject), 500);
        } else if (receipt.status === false) {
          receipt.errorMessage = 'Transaction failed';
          reject(receipt);
        } else {
          resolve(receipt);
        }
      });
    };
  }
  async _transact(method, args, accountAddress) {
    await this._init()
    const gas = await this._estimatedGas(method, args, accountAddress)
      //this.web3.eth.getGasPrice(),
    let txRaw = [
      {
        from: accountAddress,
        to: this.contractAddress,
        gas: Web3.utils.numberToHex(gas),
        value: Web3.utils.numberToHex('0'),
        data: this.contract.methods[method](...args).encodeABI(),
      },
    ];
    let tx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: txRaw,
    });
    return await new Promise(this._getTransactionReceipt(tx));
  }
}
