import {
  perpetualPoolRouterFactory
} from '../factory'
import {TIMEOUT, ROUTER_V2_ADDRESS, POOL_V2_ADDRESS } from '../../shared/__test__/setup';

describe('perpetualPoolRouter', () => {
  let perpetualPoolRouter
  beforeAll(() => {
    perpetualPoolRouter = perpetualPoolRouterFactory('97', ROUTER_V2_ADDRESS)
  })
  test('pool()', async() => {
    const output =  POOL_V2_ADDRESS
    expect(await perpetualPoolRouter.pool()).toEqual(output)
  }, TIMEOUT)
})