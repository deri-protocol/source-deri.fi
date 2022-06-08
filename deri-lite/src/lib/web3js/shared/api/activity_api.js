import { normalizeAddress, normalizeChainId } from "../utils"
import { DeriEnv, getBrokerConfig, getPoolConfig2 } from '../config';
import { brokerManagerFactory, pTokenAirdropFactory } from "../factory"
import { pTokenFactory } from "../../v2/factory"

const AIRDROP_PTOKEN_ADDRESS_BSC = '0x94e7f76eb542657Bc8d2a9aA321D79F66F7C8FfA'
const AIRDROP_PTOKEN_ADDRESS_BSCTESTNET = '0x3b88a9B5896a49AEb23Ca2Ee9892d28d3B8De5f6'


export const getBroker = async(chainId, accountAddress) => {
  chainId = normalizeChainId(chainId)
  accountAddress = normalizeAddress(accountAddress)
  const {address: brokerAddress} = getBrokerConfig('v2', chainId)
  let res = ''
  try {
    const brokerManager = brokerManagerFactory(chainId, brokerAddress)
    res = await brokerManager.getBroker(accountAddress)
  } catch (err) {
    console.log(err)
  }
  return res
}

export const setBroker = async(chainId, accountAddress, brokerAddress) => {
  chainId = normalizeChainId(chainId)
  accountAddress = normalizeAddress(accountAddress)
  brokerAddress = normalizeAddress(brokerAddress);
  const {address: brokerManagerAddress} = getBrokerConfig('v2', chainId)
  let res
  try {
    const brokerManager = brokerManagerFactory(chainId, brokerManagerAddress)
    const tx = await brokerManager.setBroker(accountAddress, brokerAddress);
    res = { success: true, transaction: tx };
  } catch (err) {
    res = { success: false, error: err };
  }
  return res
}

const getAirdropPTokenAddress = () => {
  const env = DeriEnv.get()
  if (env === 'prod') {
    return AIRDROP_PTOKEN_ADDRESS_BSC
  } else {
    return AIRDROP_PTOKEN_ADDRESS_BSCTESTNET
  }
}

export const airdropPToken = async (chainId, accountAddress) => {
  let res
  let contractAddress = getAirdropPTokenAddress()
  try {
    const tx = await pTokenAirdropFactory(chainId, contractAddress).airdropPToken(accountAddress)
    res = { success: true, transaction: tx };
  } catch (err) {
    res = { success: false, error: err };
  }
  return res
}

export const getAirdropPTokenWhitelistCount = async (chainId) => {
  let res
  let contractAddress = getAirdropPTokenAddress()
  try {
    res = await pTokenAirdropFactory(chainId, contractAddress).totalWhitelistCount()
  } catch (err) {
    console.log(`${err}`)
  }
  return res
}

export const isUserPTokenExist = async (chainId, poolAddress, accountAddress) => {
  let res = ''
  try {
    const {pToken:pTokenAddress} = getPoolConfig2(poolAddress)
    const pToken = pTokenFactory(chainId, pTokenAddress)
    const result = await pToken.balanceOf(accountAddress)
    if (result === '1') {
      res = true
    } else if (result === '0') {
      res = false
    }
  } catch (err) {
    console.log(`${err}`)
  }
  return res
}