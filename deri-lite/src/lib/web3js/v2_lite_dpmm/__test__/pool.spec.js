import { perpetualPoolLiteDpmmFactory} from "../contract/factory"

describe('test', () => {
  const account = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF'
  it('pool init', async() => {
    const pool = perpetualPoolLiteDpmmFactory('97', '0x792ec4De2B607baEF7DAAE9d238d73Ffb4819972', '13590247')
    await pool.init()
    expect(await pool.getConfig()).toEqual({
      bToken: '0xaa2B8115c094445e96C2CD951c17a30F41867323',
      bTokenSymbol: 'TBUSD',
      chainId: '97',
      initialBlock: '13590247',
      lToken: '0xfd3bfb84Db09733dB47F6bBfdE167e602dEC2Fb7',
      pToken: '0xA6309EE8378Be048B6985746655EaE2b878dad26',
      pool: '0x792ec4De2B607baEF7DAAE9d238d73Ffb4819972',
      symbols: [
        {
          symbol: 'BTCUSD',
          symbolId: '0',
          unit: 'BTC',
        },
        {
          symbol: 'ETHUSD',
          symbolId: '1',
          unit: 'ETH',
        },
      ],
      type: 'perpetual',
      version: 'v2_lite',
      versionId: 'v2_lite_dpmm',
    });
    expect(pool.addresses).toEqual({
      bTokenAddress: '0xaa2B8115c094445e96C2CD951c17a30F41867323',
      lTokenAddress: '0xfd3bfb84Db09733dB47F6bBfdE167e602dEC2Fb7',
      liquidatorQualifierAddress: '0x0000000000000000000000000000000000000000',
      pTokenAddress: '0xA6309EE8378Be048B6985746655EaE2b878dad26',
      protocolFeeCollector: '0x3B6FCA4E50BF6233224eE8C5a1a99bae72748b68',
    });
    expect(pool.parameters).toEqual({
      initialMarginRatio: '0.1',
      liquidationCutRatio: '0.5',
      maintenanceMarginRatio: '0.05',
      maxLiquidationReward: '1000',
      minLiquidationReward: '0',
      poolMarginRatio: '1',
      protocolFeeCollectRatio: '0.8',
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
    expect((await pool.getTraderLiquidity(account))).toEqual("88")
    //expect((await pool.getDynamicEquity())).toEqual('')
    //expect((await pool.getPoolRequiredMargin())).toEqual('')
    expect((await pool.getTraderMarginStatus(account))).toEqual([])

  }, 30000)
})