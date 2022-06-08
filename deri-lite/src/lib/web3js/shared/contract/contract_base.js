import { web3Factory } from '../factory/web3';
import { numberToHex } from '../utils/convert';

const MAX_GAS_AMOUNT = 832731 * 3;
//const RE_ERROR_MSG = /\"message\":\s\"execution\sreverted:([\w\s]+)\"/
const RE_ERROR_MSG = /"message":\s"execution\sreverted:([\w\s]+)"/

export class ContractBase {
  constructor(chainId, contractAddress, contractAbi) {
    this.chainId = chainId;
    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
  }

  async _init() {
    // re-init web3 and contract when web3 instance is null
    if (!this.web3) {
      this.web3 = await web3Factory.get(this.chainId);
      this.contract = new this.web3.eth.Contract(
        this.contractAbi,
        this.contractAddress
      );
    }
  }

  async _call(method, args = []) {
    let res
    let retry = 3
    while (retry > 0) {
      try {
        await this._init()
        res = await this.contract.methods[method](...args).call();
        break
      } catch(err) {
        retry -= 1
        // remove web3 instance to re-init
        if (retry === 1) {
          this.web3 = null
        }
        // if (err.toString().includes('Invalid JSON RPC response')) {
        //   console.log(`Invalid JSON RPC response with chainId(${this.chainId})`);
        // } else if (err.toString().includes("Returned values aren't valid,")) {
        //   console.log(`Invalid contract address(${this.contractAddress}) and chainId(${this.chainId})`);
        // } else {
        //   //console.log('error:', err.toString())
        // }
      }
    }
    if (retry === 0 && !res) {
      throw new Error(`The contract(${this.contractAddress}) '${method}([${args}])' failed with max retry 2.`)
    }
    return res
  }

  async _estimatedGas(method, args = [], accountAddress) {
    await this._init()
    let gas = 0;
    for (let i = 0; i < 2; i++) {
      try {
        gas = await this.contract.methods[method](...args).estimateGas({
          from: accountAddress,
        });
        gas = parseInt(gas * 1.25);
        break;
      } catch (error) {
        console.log(`-- estimatedGas: ${error}`)
        // const res = error.toString().split('\n').join('').match(RE_ERROR_MSG)
        // if (Array.isArray(res) && res.length >= 2) {
        //   throw new Error(res[1].trim())
        // }
      }
    }
    if (gas === 0) gas = MAX_GAS_AMOUNT;
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
          //receipt.errorMessage = 'Transaction failed';
          reject(receipt);
        } else {
          resolve(receipt);
        }
      });
    };
  }
  async _transact(method, args=[], accountAddress) {
    await this._init()
    const gas = await this._estimatedGas(method, args, accountAddress)
    let gasPrice = await this.web3.eth.getGasPrice()
    console.log('gasPrice before', gasPrice)
    if (this.chainId.toString() === '56') {
      gasPrice = gasPrice * 1.002
    }
    let txRaw = [
      {
        from: accountAddress,
        to: this.contractAddress,
        gas: numberToHex(gas),
        gasPrice:numberToHex(gasPrice),
        value: numberToHex('0'),
        data: this.contract.methods[method](...args).encodeABI(),
      },
    ];
    let tx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: txRaw,
    });
    return await new Promise(this._getTransactionReceipt(tx));
    //return await this.contract.methods[method](...args).send({from: accountAddress})
  }

}
