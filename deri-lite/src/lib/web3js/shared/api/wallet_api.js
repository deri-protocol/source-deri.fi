import {
  hexToNumber,
  fromWei,
  catchSyncApiError,
  catchApiError,
  getChainGasUnit,
} from '../utils';
import {
  checkChainId,
  checkAddress,
} from '../config'
import { web3Factory } from '../factory';

export const hasWallet = () => {
  return catchSyncApiError(() => {
    let res = {};
    if (window.ethereum) {
      res.hasWallet = true;
      if (window.ethereum.isMetaMask) {
        res.isMetaMask = true;
      }
      return res;
    }
    throw new Error('WEB3_WALLET_NOT_FOUND');
  });
};

export const connectWallet = async (
  handleChainChanged,
  handleAccountChanged
) => {
  return catchApiError(
    async () => {
      if (window != null && window.ethereum != null) {
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
        });
        window.ethereum.on('chainChanged', (chainId) => {
          let res = hexToNumber(chainId);
          if (typeof handleChainChanged === 'function') {
            handleChainChanged(res);
          } else {
            window.location.reload();
          }
        });
        return { account, chainId };
      }
      throw new Error('WEB3_WALLET_NOT_FOUND');
    },
    [],
    { account: '', chainId: '' }
  );
};

export const getUserWalletBalance = async (chainId, accountAddress) => {
  return catchApiError(
    async () => {
      chainId = checkChainId(chainId);
      accountAddress = checkAddress(accountAddress);
      const web3 = await web3Factory.get(chainId);
      const balance = await web3.eth.getBalance(accountAddress);
      return  {
        balance: fromWei(balance),
        unit: getChainGasUnit(chainId),
      }
    },
  );
};
