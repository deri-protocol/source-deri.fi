import { debug } from '../config';
import { web3Factory } from '../factory/web3';
import { getWeb3 } from '../utils';

const MAX_GAS_AMOUNT = 832731 * 3;

const noOp = () => {}

export class ContractBase {
  constructor(chainId, contractAddress, contractAbi) {
    this.chainId = chainId;
    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
  }

  async _init() {
    // re-init web3 and contract when web3 instance is null
    if (!this.web3) {
      if (!!this.useProvider) {
        this.web3 = await getWeb3(this.chainId);
      } else {
        this.web3 = await web3Factory.get(this.chainId);
      }
      // this.web3.eth.handleRevert = true
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
        return res
      } catch(err) {
        debug() && console.log(err)
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
      retry -= 1
    }
    throw new Error('JSON_RPC_CALL_TIMEOUT', {
      name: method,
      args: [...args, this.contractAddress],
    });
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
  async _transact(method, args=[], accountAddress, opts={}) {
    await this._init()
    let { onAccept, onReject, ...restOpts } = opts
    if (!onAccept) {
      onAccept = noOp
    }
    if (!onReject) {
      onReject = noOp
    }
    // this.web3 = await web3Factory.get(this.chainId);
    // this.contract = new this.web3.eth.Contract(
    //   this.contractAbi,
    //   this.contractAddress
    // );
    let [gas, gasPrice] = await Promise.all([
      this._estimatedGas(method, args, accountAddress),
      this.web3.eth.getGasPrice(),
    ]);
    if (this.chainId.toString() === '56') {
      gasPrice = gasPrice * 1.002
    }
    // let txRaw = [
    //   {
    //     from: accountAddress,
    //     to: this.contractAddress,
    //     gas: numberToHex(gas),
    //     gasPrice: numberToHex(gasPrice),
    //     value: numberToHex('0'),
    //     data: this.contract.methods[method](...args).encodeABI(),
    //     ...opts,
    //   },
    // ];
    // let tx = await window.ethereum.request({
    //   method: 'eth_sendTransaction',
    //   params: txRaw,
    // });
    // return await new Promise(this._getTransactionReceipt(tx));

    return await this.contract.methods[method](...args).send({
      from: accountAddress,
      gas,
      gasPrice,
      ...restOpts,
    }).on('transactionHash', (txHash) => {
      onAccept()
    }).on('error', (error) => {
      if (error.code === 4001) { // user reject
        onReject()
      }
    });

  }

}
