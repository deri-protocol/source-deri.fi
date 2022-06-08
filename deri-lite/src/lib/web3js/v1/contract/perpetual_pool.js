import {
  validateArgs,
  deriToNatural,
  numberToHex,
  bg,
} from '../../shared/utils';
import {
  calculateFundingRate,
  calculateLiquidityUsed,
  processFundingRate,
} from '../calculation';
import { ContractBase } from '../../shared/contract/contract_base';
import { getPriceInfoForV1 } from '../../shared/utils/oracle';

/* eslint-disable */
const POOL_ABI=[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"lShares","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"AddLiquidity","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"DepositMargin","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"migrationTimestamp","type":"uint256"},{"indexed":false,"internalType":"address","name":"source","type":"address"},{"indexed":false,"internalType":"address","name":"target","type":"address"}],"name":"ExecuteMigration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"int256","name":"volume","type":"int256"},{"indexed":false,"internalType":"int256","name":"cost","type":"int256"},{"indexed":false,"internalType":"uint256","name":"margin","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"address","name":"liquidator","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"Liquidate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"migrationTimestamp","type":"uint256"},{"indexed":false,"internalType":"address","name":"source","type":"address"},{"indexed":false,"internalType":"address","name":"target","type":"address"}],"name":"PrepareMigration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"lShares","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"RemoveLiquidity","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"int256","name":"tradeVolume","type":"int256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"Trade","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"WithdrawMargin","type":"event"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"approveMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"controller","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"depositMargin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"depositMargin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"source","type":"address"}],"name":"executeMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAddresses","outputs":[{"internalType":"address","name":"bToken","type":"address"},{"internalType":"address","name":"pToken","type":"address"},{"internalType":"address","name":"lToken","type":"address"},{"internalType":"address","name":"oracle","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getParameters","outputs":[{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"minPoolMarginRatio","type":"uint256"},{"internalType":"uint256","name":"minInitialMarginRatio","type":"uint256"},{"internalType":"uint256","name":"minMaintenanceMarginRatio","type":"uint256"},{"internalType":"uint256","name":"minAddLiquidity","type":"uint256"},{"internalType":"uint256","name":"redemptionFeeRatio","type":"uint256"},{"internalType":"uint256","name":"fundingRateCoefficient","type":"uint256"},{"internalType":"uint256","name":"minLiquidationReward","type":"uint256"},{"internalType":"uint256","name":"maxLiquidationReward","type":"uint256"},{"internalType":"uint256","name":"liquidationCutRatio","type":"uint256"},{"internalType":"uint256","name":"priceDelayAllowance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getStateValues","outputs":[{"internalType":"int256","name":"cumuFundingRate","type":"int256"},{"internalType":"uint256","name":"cumuFundingRateBlock","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"int256","name":"tradersNetVolume","type":"int256"},{"internalType":"int256","name":"tradersNetCost","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"address[4]","name":"addresses_","type":"address[4]"},{"internalType":"uint256[12]","name":"parameters_","type":"uint256[12]"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"liquidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"liquidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"migrationDestination","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"migrationTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newPool","type":"address"},{"internalType":"uint256","name":"graceDays","type":"uint256"}],"name":"prepareMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"lShares","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"lShares","type":"uint256"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newController","type":"address"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"tradeVolume","type":"int256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"trade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"tradeVolume","type":"int256"}],"name":"trade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"tradeVolume","type":"int256"},{"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"tradeWithMargin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"tradeVolume","type":"int256"},{"internalType":"uint256","name":"bAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"tradeWithMargin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"}],"name":"withdrawMargin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"withdrawMargin","outputs":[],"stateMutability":"nonpayable","type":"function"}]
/* eslint-enable */

export class PerpetualPool extends ContractBase {
  constructor(chainId, contractAddress, isProvider) {
    super(chainId, contractAddress, POOL_ABI, isProvider);
    // this.contract = new this.web3.eth.Contract(POOL_ABI, this.contractAddress);
  }

  async symbol() {
    return await this._call('symbol');
  }

  async getStateValues() {
    let result;
    const defaultValue = bg(0);
    try {
      const res = await this._call('getStateValues');
      //console.log("getStateValues() raw:", res)
      result = {
        cumuFundingRate: deriToNatural(res.cumuFundingRate),
        cumuFundingRateBlock: bg(res.cumuFundingRateBlock),
        liquidity: deriToNatural(res.liquidity),
        tradersNetVolume: deriToNatural(res.tradersNetVolume),
        tradersNetCost: deriToNatural(res.tradersNetCost),
      };
    } catch (err) {
      result = {
        cumuFundingRate: defaultValue,
        cumuFundingRateBlock: defaultValue,
        liquidity: defaultValue,
        tradersNetCost: defaultValue,
        tradersNetVolume: defaultValue,
      };
      console.log(`getStateValues: ${err}`);
    }
    return result;
  }

  async getParameters() {
    let result;
    const defaultValue = bg(0);
    try {
      const res = await this._call('getParameters');
      // console.log("getParameters() raw: ", res)
      result = {
        multiplier: deriToNatural(res.multiplier),
        feeRatio: deriToNatural(res.feeRatio),
        minPoolMarginRatio: deriToNatural(res.minPoolMarginRatio),
        minInitialMarginRatio: deriToNatural(res.minInitialMarginRatio),
        minMaintenanceMarginRatio: deriToNatural(res.minMaintenanceMarginRatio),
        minAddLiquidity: deriToNatural(res.minAddLiquidity),
        redemptionFeeRatio: deriToNatural(res.redemptionFeeRatio),
        fundingRateCoefficient: deriToNatural(res.fundingRateCoefficient),
        minLiquidationReward: deriToNatural(res.minLiquidationReward),
        maxLiquidationReward: deriToNatural(res.maxLiquidationReward),
        liquidationCutRatio: deriToNatural(res.liquidationCutRatio),
        priceDelayAllowance: bg(res.priceDelayAllowance),
      };
    } catch (err) {
      result = {
        multiplier: defaultValue,
        feeRatio: defaultValue,
        minPoolMarginRatio: defaultValue,
        minInitialMarginRatio: defaultValue,
        minMaintenanceMarginRatio: defaultValue,
        minAddLiquidity: defaultValue,
        redemptionFeeRatio: defaultValue,
        fundingRateCoefficient: defaultValue,
        minLiquidationReward: defaultValue,
        maxLiquidationReward: defaultValue,
        liquidationCutRatio: defaultValue,
        priceDelayAllowance: defaultValue,
      };
      console.log(`getParameters: ${err}`);
    }
    return result;
  }

  _getTransactionReceipt(tx) {
    const self = this;
    return function _transactionReceipt(resolve, reject) {
      self.web3.eth.getTransactionReceipt(tx, (error, receipt) => {
        if (error) {
          reject(error);
        } else if (receipt == null) {
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
  async _estimatedGas(method, args, accountAddress) {
    // !this.accountAddress &&
    //   console.log('please do setAccount(accountAddress) first');
    const MAX_GAS_AMOUNT = 582731
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

  // overwrite to use signed price to tx
  async _transact(method, args = [], accountAddress) {
    await this._init()
    const symbol = await this.symbol()
    const oracle = await getPriceInfoForV1(symbol);
    let signed = [oracle.timestamp, oracle.price, parseInt(oracle.v).toString(), oracle.r, oracle.s];

    const gas = await this._estimatedGas(method, [...args, ...signed], accountAddress)

    let txRaw = [
      {
        from: accountAddress,
        to: this.contractAddress,
        gas: numberToHex(gas),
        value: numberToHex('0'),
        data: this.contract.methods[method](...args, ...signed).encodeABI(),
      },
    ];
    let tx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: txRaw,
    });
    return await new Promise(this._getTransactionReceipt(tx));
  }

  async getFundingRate() {
    let price, fundingRate, fundingRatePerBlock, liquidityUsed;
    const symbol = await this.symbol()
    price = deriToNatural((await getPriceInfoForV1(symbol)).price).toString();
    try {
      const stateValues = await this.getStateValues();
      const parameters = await this.getParameters();
      const { tradersNetVolume, liquidity } = stateValues;
      const {
        multiplier,
        fundingRateCoefficient,
        minPoolMarginRatio,
      } = parameters;
      const args1 = [
        tradersNetVolume,
        price,
        multiplier,
        liquidity,
        fundingRateCoefficient,
      ];
      if (!validateArgs(...args1)) {
        fundingRate = '0';
        fundingRatePerBlock = '0';
      } else {
        fundingRatePerBlock = calculateFundingRate(...args1);
        fundingRate = processFundingRate(this.chainId, fundingRatePerBlock);
      }
      const args2 = [
        tradersNetVolume,
        price,
        multiplier,
        liquidity,
        minPoolMarginRatio,
      ];
      if (!validateArgs(...args2)) {
        liquidityUsed = '0';
      } else {
        liquidityUsed = calculateLiquidityUsed(...args2);
      }
      return {
        price,
        multiplier: multiplier.toString(),
        fundingRate: fundingRate,
        fundingRatePerBlock: fundingRatePerBlock,
        tradersNetVolume: tradersNetVolume.toString(),
        liquidity: liquidity.toString(),
        fundingRateCoefficient: fundingRateCoefficient.toString(),
        liquidityUsed: liquidityUsed,
        poolMarginRatio: minPoolMarginRatio.toString(),
      };
    } catch (err) {
      console.log('PerpetualPool#gerFundingRate():', err);
      throw err;
    }
  }

  async depositMargin(accountAddress, amount) {
    let res;
    try {
      let tx = await this._transact(
        'depositMargin(uint256,uint256,uint256,uint8,bytes32,bytes32)',
        [amount],
        accountAddress
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      console.log('here');
      res = { success: false, error: err };
    }
    return res;
  }

  // util methods, it's extract shared/utils now
  async _getBlockInfo(blockNumber) {
    await this._init()
    return await this.web3.eth.getBlock(blockNumber);
  }

  async _getPastEvents(eventName, filter = {}, fromBlock = 0, to = 0) {
    await this._init()
    let events = [];
    //let toBlock = await this._getBlockInfo("latest");
    //toBlock = toBlock.number;
    let amount;
    if (['56', '137', '97', '80001'].includes(this.chainId)) {
      amount = 999;
    } else {
      amount = 4999;
    }
    if (fromBlock + amount > to) {
      amount = to - fromBlock;
    }
    while (fromBlock <= to) {
      //console.log('tick')
      let es = await this.contract.getPastEvents(eventName, {
        filter: filter,
        fromBlock,
        toBlock: fromBlock + amount,
      });
      for (let e of es) {
        events.push(e);
      }
      fromBlock += amount + 1;
      if (fromBlock + amount > to) {
        amount = to - fromBlock;
      }
    }
    return events;
  }
  async _getTimeStamp(blockNumber) {
    await this._init()
    return await this.web3.eth.getBlock(blockNumber);
  }
  _calculateFee(volume, price, multiplier, feeRatio) {
    return bg(volume)
      .abs()
      .times(price)
      .times(multiplier)
      .times(feeRatio)
      .toString();
  }
}
