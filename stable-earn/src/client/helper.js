import { AddressZero } from "@ethersproject/constants";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import {
  GAS_PRICE_ADJUSTMENT_MAP,
  MAX_GAS_LIMIT,
  MAX_GAS_PRICE_MAP,
  RPC_PROVIDERS,
  SUPPORTED_MAINNET_NETWORKS,
} from "../utils/Constants";
import { random,bigNumberify } from "../utils/utils";
import { ethers } from "ethers";

// account is not optional
export function getSigner(
  provider,
  account
){
  return provider.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  provider,
  account
) {
  return account ? getSigner(provider, account) : provider;
}

// account is optional
export function getContract(
  address,
  ABI,
  provider,
  account
){
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(provider, account) 
  );
}

export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function contractResponseProcess(response, prop) {
  const value= response[prop];
  return formatEther(BigNumber.from(value._hex));
}

export async function setGasPrice(
  txnOpts,
  provider,
  chainId
) {
  let maxGasPrice = MAX_GAS_PRICE_MAP[chainId];
  const premium = GAS_PRICE_ADJUSTMENT_MAP[chainId] || bigNumberify(0);

  const gasPrice = await provider.getGasPrice();

  if (maxGasPrice) {
    if (gasPrice.gt(maxGasPrice)) {
      maxGasPrice = gasPrice;
    }

    const feeData = await provider.getFeeData();

    // the wallet provider might not return maxPriorityFeePerGas in feeData
    // in which case we should fallback to the usual getGasPrice flow handled below
    if (feeData && feeData.maxPriorityFeePerGas) {
      txnOpts.maxFeePerGas = maxGasPrice;
      txnOpts.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.add(premium);
      return;
    }
  }

  txnOpts.gasPrice = gasPrice.add(premium);
  return;
}

export async function getGasLimit(
  contract,
  method,
  params,
  value
){
  const defaultValue = bigNumberify(0);
  if (!value) {
    value = defaultValue;
  }
  let gasLimit;
  try {
    gasLimit = await contract.estimateGas[method](...params, { value });
    if (gasLimit.lt(22000)) {
      gasLimit = !bigNumberify(22000);
    }
    return gasLimit.mul(11000).div(10000); // add a 10% buffer  
  } catch (error) {
    gasLimit = bigNumberify(MAX_GAS_LIMIT)
    throw error;
  }

}

export function getProviderRpc(chainId) {
  const providers = RPC_PROVIDERS[chainId];
  return providers[random(0, providers.length - 1)];
}

export function getProvider(chainId) {
  const rpc = getProviderRpc(chainId);
  const network = SUPPORTED_MAINNET_NETWORKS.find(
    (network) => network.chainId === chainId
  );
  if (!network) {
    throw new Error(`Invalid network ${chainId}`);
  }
  return new ethers.providers.StaticJsonRpcProvider(rpc, {
    chainId,
    name: network.name,
  });
}

export async function getTransaction(provider, hash) {
  let reason
  try {
    const tx = await provider.getTransaction(hash);
    if (tx && tx.blockNumber) {
      let res = await provider.call(tx, tx.blockNumber);
      console.log(res)
    }
  } catch (err) {
    if (err.message) {
      let msg = err.message;
      reason = msg.replace('execution reverted: ', '')
      reason = msg.replace(/Transaction\sfailed!\s*:/, '')
    }
  }
  return reason
}

export function hex_to_ascii(str1 ) {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, 2), 16));
	}
	return str;
 }

  // const getTransaction = useCallback(
  //   (hash: string) => {
  //     if (!provider) throw new Error("No provider");
  //     return retry(
  //       () =>
  //         provider.getTransaction(hash).then((transaction) => {
  //           if (transaction === null) {
  //             throw new RetryableError();
  //           }
  //           return transaction;
  //         }),
  //       DEFAULT_RETRY_OPTIONS
  //     );
  //   },
  //   [provider]
  // );