import { debug } from '../utils/env';
import { getWeb3, getWeb3WithSigner } from '../utils/web3';

const MAX_GAS_AMOUNT = 813256 * 5;

const noOp = () => {}

export class ContractBase {
  constructor(chainId, contractAddress, contractAbi, isNodeEnv=false) {
    this.chainId = chainId;
    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
    this.isNodeEnv = isNodeEnv;
  }

  async _init(isTx=false) {
    // re-init web3 and contract when web3 instance is null

    if (!this.web3) {
      // console.log('isNodeEnv', this.isNodeEnv, this.web3)
      let retry = 2
      while (retry > 0) {
        try {
          if (this.isNodeEnv) {
            this.web3 = await getWeb3WithSigner(this.chainId);
          } else {
            this.web3 = await getWeb3(this.chainId, isTx);
          }
          if (this.web3) {
            this.contract = new this.web3.eth.Contract(
              this.contractAbi,
              this.contractAddress
            );
            return
          }
        } catch (err) {
          // debug() && console.log(err)
        }
        retry = retry - 1
      }
      throw new Error(`Contract init(): cannot get web3 provider with chainId(${this.chainId})`)
    }
  }

  async _call(method, args = []) {
    let res
    let retry = 3
    while (retry > 0) {
      try {
        if (!this.web3) {
          await this._init()
        }
        res = await this.contract.methods[method](...args).call();
        return res
      } catch(err) {
        debug() && console.log(`_call ${method}(${args.join(',')})`, err)
        // remove web3 instance to re-init
        if (retry === 1 && this.web3) {
          // this.web3 = null
          await this.web3._update.bind(this.web3)();
        }
      }
      retry -= 1
    }
    throw new Error(`JSON_RPC_CALL_TIMEOUT: poolAddress:${this.contractAddress} ${method}(${args.join(',')})`);
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
      } catch (error) {
        debug() && console.log(`-- estimatedGas: ${error}`)
      }
    }
    if (gas === 0) gas = MAX_GAS_AMOUNT;
    return gas;
  }

  async _transact(method, args=[], accountAddress, opts={}) {
    delete this.web3;
    await this._init(true)
    let { onAccept, onReject, ...restOpts } = opts
    if (!onAccept) {
      onAccept = noOp
    }
    if (!onReject) {
      onReject = noOp
    }
    let [gas, gasPrice] = await Promise.all([
      this._estimatedGas(method, args, accountAddress),
      this.web3.eth.getGasPrice(),
    ]);
    // fix gasPrice in BNB
    // if (this.chainId.toString() === '56') {
    //   gasPrice = gasPrice * 1.002
    // }

    debug() && console.log(`-- method: ${method} from: ${accountAddress} gas: ${gas} gasPrice: ${gasPrice}`)

    return await this.contract.methods[method](...args).send({
      from: accountAddress,
      // from: this.web3.eth.defaultAccount,
      gas,
      gasPrice,
      ...restOpts,
    }).on('transactionHash', (txHash) => {
      onAccept(txHash, {...args})
    }).on('error', (error) => {
      if (error.code === 4001) { // user reject
        onReject()
      }
    });
  }
}
