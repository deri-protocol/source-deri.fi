import { perpetualPoolLiteViewerFactory } from "../factory"
import { POOL_V2L_VIEWER_ADDRESS, CHAIN_ID, POOL_ADDRESS_LITE, TIMEOUT } from "../../v2/__test__/setup"

describe('PerpetualPoolLiteViewer', () => {
  it('getOffChainOracleSymbols', async() => {
    const pool = perpetualPoolLiteViewerFactory(CHAIN_ID, POOL_V2L_VIEWER_ADDRESS)
    const res = await pool.getOffChainOracleSymbols(POOL_ADDRESS_LITE)
    const output = [
      '',
      '',
      'AXSUSDT',
      'MANAUSDT',
      'MBOXUSDT',
      'IBSCDEFI',
      'IGAME',
      'ALICEUSDT',
      'SANDUSDT',
      'QUICKUSDT',
      'GHSTUSDT',
    ];
    expect(res).toEqual(output)
  }, TIMEOUT)
})