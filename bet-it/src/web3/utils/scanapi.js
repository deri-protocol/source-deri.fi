import Web3 from "web3"
import { fromWei } from "./bignumber"
import { checkChainId, getChainConfig, isBSCChain } from "./chain"
import { debug } from "./env"
import { fetchJson } from "./rest"
import { HextoNumber, HextoNumberString, padLeft, toHex } from "./web3"

// scanapi proxy
const buildScanApi = (arg) => {
  return buildBscScanApi(arg)
}

  const toParams = (name, val) => {
    if (name !== '' && val !== '') {
      return `${name}=${val}`
    } else {
      console.log(`invalid params name or value: ${name}(${val})`)
      return ''
    }
  }
  const buildBscScanApi = ({chainId, module, fromBlock, toBlock, address, topic0, topic1, topic2, topic3}) => {
    const apiKey = ''
    let urlBase = getChainConfig(chainId).scanapi
    let action = ''
    if (module === 'logs') {
      action = 'getLogs'
    } else {
      throw new Error(`invalid bscscan api module: ${module}`)
    }
    let urlPathParams = [
      toParams('module', module),
      toParams('action', action),
      toParams('fromBlock', fromBlock),
      toParams('toBlock', toBlock),
      toParams('address', address),
      ...((topic0, topic1, topic2) => {
        let res = []
        if (topic0) {
           res.push(toParams('topic0', topic0))
          if (topic1) {
            res.push(toParams('topic0_1_opr', 'and'))
            res.push(toParams('topic1', topic1))
          }
          if (topic2) {
            res.push(toParams('topic0_2_opr', 'and'))
            res.push(toParams('topic2', topic1))
          }
        }
        return res
      })(topic0, topic1, topic2, topic3),
      toParams('apiKey', apiKey)
    ]
    return `${urlBase}?${urlPathParams.filter((p) => !!p).join('&')}`
  }

export const getLastTradeInfoFromScanApi = async ({ chainId, poolAddress, pTokenId, fromBlock, toBlock }) => {
  const web3 = new Web3()

  const topic0 = web3.eth.abi.encodeEventSignature('Trade(uint256,bytes32,int256,int256,int256,int256)')
  const eventData = [{ "indexed": false, "internalType": "int256", "name": "indexPrice", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "tradeVolume", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "tradeCost", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "tradeFee", "type": "int256" }]
  try {
    const url = buildScanApi({ chainId, address: poolAddress, topic0, topic1: padLeft(toHex(pTokenId), 64), module: 'logs', fromBlock, toBlock })
    debug() && console.log('url', url)
    const res = await fetchJson(url)
    debug() && console.log(res.result.length)
    if (Array.isArray(res.result) && res.result.length > 0) {
      const result = res.result.map((r) => {
        const pTokenId = r.topics[1]
        const symbolId = r.topics[2]
        const data = web3.eth.abi.decodeParameters(eventData, r.data)
        return {
          blockNumber: HextoNumber(r.blockNumber),
          symbolId,
          pTokenId: HextoNumberString(pTokenId),
          indexPrice: fromWei(data.indexPrice),
          tradeVolume: fromWei(data.tradeVolume),
          tradeCost: fromWei(data.tradeCost),
          tradeFee: fromWei(data.tradeFee),
        }
      }).sort((a, b) => b.blockNumber - a.blockNumber)
      return result[0]
    }
  } catch (err) {
    debug() && console.log(err)
  }
  return { tradeFee: '1', blockNumber: 1}
}