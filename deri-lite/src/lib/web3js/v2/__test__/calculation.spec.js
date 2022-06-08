import {
  calculateEntryPrice,
  calculatePnl,
  calculateFundingRate,
  calculateLiquidityUsed,
  calculateBTokenDynamicEquities,
  isBToken0RatioValid,
  isPoolMarginRatioValid,
  calculateFundingFee,
  calculateShareValue,
  calculateMaxRemovableShares,
} from '../calculation';
import { bg } from '../../shared/utils';
import { TIMEOUT } from '../../shared/__test__/setup';

describe('calculation', () => {
  test('calculateEntryPrice', () => {
    // price, volume, multiplier, cost
    const input = [bg('7'), bg('12.3'), bg('0.0001')]
    const output = '17571.42857142857142'
    expect(calculateEntryPrice(...input).toString()).toEqual(output)
  })
  test('calculatePnl', () => {
    // price, volume, multiplier, cost
    const input = [bg('36.97'), bg('7'), bg('0.1'), bg('27.33')]
    const output = bg('-1.451')
    expect(calculatePnl(...input)).toEqual(output)
  })
  test('calculateFundingRate()', () => {
    // price, volume, multiplier, cost
    const input = ['36.97', '7000', '0.1', '1000', '0.0001']
    const output = bg('0.0025879')
    expect(calculateFundingRate(...input)).toEqual(output)

    function withInvalidArgs() {
      return calculateFundingRate('36.97', '7000', undefined, '1000', '0.0001')
    }
    expect(withInvalidArgs).toThrow(/invalid args/);
  })
  test('calculateLiquidityUsed', () => {
    // price, volume, multiplier, cost
    const input = ['29.99', '6999', '0.1', '1000', '0.1']
    const output = bg('2.0990001')
    expect(calculateLiquidityUsed(...input)).toEqual(output)
    const input2 = ['-29.99', '6999', '0.1', '1000', '0.1']
    const output2 = bg('2.0990001')
    expect(calculateLiquidityUsed(...input2)).toEqual(output2)
  })
  test('calculateBTokenDynamicEquities', () => {
    const input = [{
      liquidity: '976',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '501',
      price: '42395.89',
      discount: '0.8',
      pnl: '477',
    }]
    const output = bg('19282180.632')
    const totalDynamicEquity = calculateBTokenDynamicEquities(input)
    expect(totalDynamicEquity).toEqual(output)
  })
  test('isBToken0RatioValid', () => {
    const input = [{
      liquidity: '976',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '501',
      price: '22395.89',
      discount: '0.8',
      pnl: '477',
    }]
    const res = isBToken0RatioValid(input, '1', '10', '0.2')
    expect(res.success).toEqual(true)
    const input2 = [{
      liquidity: '976',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '501',
      price: '22395.89',
      discount: '0.8',
      pnl: '477',
    }]
    const res2 = isBToken0RatioValid(input2, '1', '11', '0.2')
    expect(res2.success).toEqual(false)
    const input3 = [{
      liquidity: '976',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '501',
      price: '22395.89',
      discount: '0.8',
      pnl: '477',
    }]
    const res3 = isBToken0RatioValid(input3, '0', '11', '0.2')
    expect(res3.success).toEqual(true)
  })
  test('isPoolMarginRatioValid', () => {
    const bTokens = [{
      liquidity: '16',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '16',
      price: '22395.89',
      discount: '0.8',
      pnl: '3215',
    }]
    const symbols = [{
      symbol: 'BTCUSD',
      multiplier: bg(0.0001),
      feeRatio: bg(0.0001),
      price: bg(36379.845),
      tradersNetVolume: bg(20313),
      tradersNetCost: bg(493.5695935),
    }, {
      symbol: 'IMEME',
      multiplier: bg(0.01),
      feeRatio: bg(0.0001),
      price: bg(60.845),
      tradersNetVolume: bg(832),
      tradersNetCost: bg(12.6741221),
    }]
    const res = isPoolMarginRatioValid(bTokens, '1', '10', '11', symbols, '1')
    expect(res.success).toEqual(true)
    const bTokens2 = [{
      liquidity: '16',
      price: '2345.67',
      discount: '1',
      pnl: '57',
    }, {
      liquidity: '16',
      price: '22395.89',
      discount: '0.8',
      pnl: '3215',
    }]
    const symbols2 = [{
      symbol: 'BTCUSD',
      multiplier: bg(0.0001),
      feeRatio: bg(0.0001),
      price: bg(36379.845),
      tradersNetVolume: bg(20313),
      tradersNetCost: bg(493.5695935),
    }, {
      symbol: 'IMEME',
      multiplier: bg(0.01),
      feeRatio: bg(0.0001),
      price: bg(60.845),
      tradersNetVolume: bg(832),
      tradersNetCost: bg(12.5741221),
    }]
    const res2 = isPoolMarginRatioValid(bTokens2, '1', '10', '11', symbols2, '1')
    expect(res2.success).toEqual(false)
  })
  test('calculateFundingFee', () => {
    const input = ['1234', '3328', '0.001', '0.005', '56789', 0.009, 0.003, 123456, 987654, '0']
    const output = '0'
    expect(calculateFundingFee(...input).toString()).toEqual(output)
    const input2 = ['1234', '3328', '0.001', '0.005', '56789', 0.009, 0.003, 123456, 987654, 199]
    const output2 = '206945.70484791'
    expect(calculateFundingFee(...input2).toFixed(8).toString()).toEqual(output2)
    const input3 = ['1234', undefined, '0.001', '0.005', '56789', 0.009, 0.003, 123456, 987654, '111']
    const output3 = 'NaN'
    expect(calculateFundingFee(...input3).toString()).toEqual(output3)
    const input4 = ['1234', '22', '0.001', '0.005', '0', 0.009, 0.003, 123456, 987654, '111']
    const output4 = '0'
    expect(calculateFundingFee(...input4).toString()).toEqual(output4)
  }, TIMEOUT)
  test('calculateShareValue', () => {
    const input = ['0', '123']
    const output = '0'
    expect(calculateShareValue(...input).toString()).toEqual(output)
    const input2 = ['121', '123']
    const output2 = '1.01652892561983471'
    expect(calculateShareValue(...input2).toString()).toEqual(output2)
  })
  test('calculateMaxRemovableShares', () => {
    const input = [22, 12345, 12435, 177, 167.9, 1]
    const output = '22'
    expect(calculateMaxRemovableShares(...input).toString()).toEqual(output)
  })
})
