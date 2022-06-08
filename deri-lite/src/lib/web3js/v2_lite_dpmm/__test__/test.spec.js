import { perpetualPoolLiteDpmmFactory} from "../contract/factory"

describe('test', () => {
  const account = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF'
  it('pool init', async() => {
    const pool = perpetualPoolLiteDpmmFactory('97', '0x43701b4bf0430DeCFA41210327fE67Bf4651604C')
    await pool.init()
    expect(pool.addresses).toEqual({
      bTokenAddress: '0xaa2B8115c094445e96C2CD951c17a30F41867323',
      lTokenAddress: '0x0D413A61F6247e06B60a9c58c13Bd39020164300',
      liquidatorQualifierAddress: '0x0000000000000000000000000000000000000000',
      pTokenAddress: '0x166a9cB3ad589f2F03c57d7819C16DdEcB58Fb3d',
      protocolFeeCollector: '0x3B6FCA4E50BF6233224eE8C5a1a99bae72748b68',
    });
    expect(pool.parameters).toEqual({
      initialMarginRatio: '0.1',
      liquidationCutRatio: '0.5',
      maintenanceMarginRatio: '0.05',
      maxLiquidationReward: '1000',
      minLiquidationReward: '0',
      poolMarginRatio: '1',
      protocolFeeCollectRatio: '0.2',
    });
    expect(pool.activeSymbolIds).toEqual(['0', '1'])
    expect(pool.activeSymbolNames).toEqual(['BTCUSD', 'ETHUSD'])
    expect(pool.offChainOracleSymbolIds).toEqual([])
    expect(pool.offChainOracleSymbolNames).toEqual([])
    expect(pool.symbols.map((s) => s.oracleAddress)).toEqual([
      '0xCc88240D8CC260f19D2A0D3B1207e9B2757195fb',
      '0x6542EF23ab10372ac7490BEe522521383865ad49',
    ]);
    expect((await pool.getConfig()).bTokenSymbol).toEqual('TBUSD')
    expect((await pool.getSymbols())[1].symbol).toEqual('ETHUSD')
    expect((await pool.getFundingPeriod())).toEqual('259200')
    expect((await pool.getSymbols('0')).length).toEqual(1)
    expect((await pool.getSymbols()).length).toEqual(2)
    expect((await pool.isSymbolsUpdated())).toEqual(true)
    expect((await pool.getPositions(account)).length).toEqual(2)
    expect((await pool.isPositionsUpdated())).toEqual(true)
    expect((await pool.getTraderLiquidity(account))).toEqual('')
    //expect((await pool.getDynamicEquity())).toEqual('')
    //expect((await pool.getPoolRequiredMargin())).toEqual('')
    expect((await pool.getTraderMarginStatus(account))).toEqual([])

  }, 30000)
})