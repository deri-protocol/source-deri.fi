import { hexToNumber, fromWei } from '../utils';
import { web3Factory } from '../factory';
import { normalizeAddress } from '../utils';

/**
 * check ethereum client status for web browser
 * @function
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.isMetaMask - check if it is MetaMask client
 * @returns {boolean} response.[error] - error message when request failed
 */
export const hasWallet = () => {
  if (window.ethereum && window.ethereum.isMetaMask) {
    return { success: true, isMetaMask: true };
  }
  return {
    success: false,
    error:
      'The browser is not support ethereum wallet, please install MetaMask to proceed.',
  };
};

/**
 *  Connect wallet using MetaMask account
 * @async
 * @function
 * @param {function} [handleChainChanged] - Callback when chainId changed
 * @param {function} [handleAccountChanged]  - callback when account changed
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {string} response.chainId - chain Id
 * @returns {string} response.account - account address
 * @returns {boolean} response.[error] - error message when request failed
 */
export const connectWallet = async (
  handleChainChanged,
  handleAccountChanged
) => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const chainId = parseInt(
      await window.ethereum.request({ method: 'net_version' })
    );
    // const chainId = hexToNumber(
    //   await window.ethereum.request({ method: 'eth_chainId' })
    // );
    const account = Array.isArray(accounts) && accounts[0];
    // await web3.eth.requestAccounts().then(console.log)
    window.ethereum.on('accountsChanged', (accounts) => {
      let account;
      if (accounts.length > 0) {
        account = accounts[0];
      } else {
        account = '';
      }
      if (typeof handleAccountChanged === 'function') {
        handleAccountChanged(account);
      } else {
        window.location.reload();
      }
      //console.log('accountChanged', account);
    });
    window.ethereum.on('chainChanged', (chainId) => {
      let res = hexToNumber(chainId);
      if (typeof handleChainChanged === 'function') {
        handleChainChanged(res);
      } else {
        window.location.reload();
      }
      //console.log('chainChanged', res);
    });
    return { success: true, account, chainId };
  }
  return {
    success: false,
    error: 'Cannot connect wallet, please install MetaMask.',
  };
};

export const getUserWalletBalance = async (chainId, walletAddress) => {
  //const web3 = web3Factory(chainId);
  walletAddress = normalizeAddress(walletAddress)
  const web3 = await web3Factory.get(chainId);
  const balance = await web3.eth.getBalance(walletAddress);
  return fromWei(balance);
};
