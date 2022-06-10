
import { getUserWalletBalance, DeriEnv, connectWallet, isUnlocked, openConfigListCache, unlock } from "../lib/web3js/index";
import config from '../config.json'
import { formatBalance } from "../utils/utils";
import { observable, computed, action, makeObservable, autorun } from "mobx";


class Wallet {

  detail = {}
  defaultNw = {}
  bTokenId = ''
  bToken = ''
  address = ''
  chainId = ''
  account = ''
  supportCurNetwork = true
  status = ''


  constructor() {
    makeObservable(this, {
      detail: observable,
      defaultNw: observable,
      bTokenId: observable,
      chainId : observable,
      account : observable,
      address: observable,
      bToken: observable,
      supportCurNetwork : observable,
      status : observable,
      setDefaultNw: action,
      setDetail: action,
      setBTokenId: action,
      setBToken: action,
      setAddress: action,
      setSupportCurNetwork : action,
      setStatus : action,
      supportV2: computed,
      supportV1: computed,
      supportAllVersion: computed,
      supportChain: computed,
      supportOpen: computed,
      balance: computed,
      isApproved: computed,
      blockExploreUrl : computed,
      supportOptions : computed,
      supportPowers : computed,
      supportClaimXVS : computed
    })
  }



  supportWeb3 = () => !!window.ethereum

  isConnected = () => !!this.detail.account;

  get isApproved() {
    return this.detail.isApproved
  }


  switchNetwork = async (network,successCb,errorCb) => {
    const chainInfo = config[DeriEnv.get()]['chainInfo']
    const chainId = `0x${(parseInt(network.id)).toString(16)}`
    network = chainInfo[parseInt(network.id)]
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      successCb && successCb()
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId, ...network.metamask }],
          });
        } catch (addError) {
          console.error('err', addError)
        }
      } else if(error.code === 4001){
        errorCb && errorCb(40001)
      } else  {
        // errorCb && errorCb()
      }
    }

  }

  get = () => {
    return this.detail;
  }

  setDetail(walletContext) {
    const {chainId,account,balance} = walletContext
    const detail = { chainId : chainId,
                     account : account, 
                     balance: balance,
                     formatBalance: formatBalance(balance)
                    }
    const env = DeriEnv.get();
    const { chainInfo } = config[env]

    if (chainInfo[chainId]) {
      Object.assign(detail, { ...chainInfo[chainId], supported: true })
    }
    this.setAccount(account);
    this.setChainId(chainId);
    this.detail = detail;
  }

  setAccount(account){
    this.account = account
  }

  setChainId(chainId){
    this.chainId = chainId
  }

  setAddress(address) {
    this.address = address
  }

  setBTokenId(bTokenId) {
    this.bTokenId = bTokenId
  }
  setBToken(bToken){
    this.bToken = bToken
  }

  setDefaultNw(network) {
    this.defaultNw = network
  }

  setSupportCurNetwork(supportted){
    this.supportCurNetwork = supportted
  }

  setStatus(status){
    this.status = status
  }

  refresh() {
    this.loadWalletBalance(this.detail.chainId, this.detail.account);
  }

  isSupportChain(isOptions) {
    const chainId = this.detail.chainId
    const env = DeriEnv.get();
    const { chainInfo } = config[env]
    if (isOptions) {
      return chainInfo[chainId] && chainInfo[chainId]['supportOptions']
    } else {
      return this.supportChain
    }
  }

  get supportV2() {
    return this.detail.supportV2
  }

  get supportV1() {
    return this.detail.supportV1;
  }

  get supportAllVersion() {
    return this.detail.supportV1 && this.detail.supportV2
  }

  get supportChain() {
    return this.detail.supported
  }

  get supportOptions(){
    return this.detail.supportOptions
  }
  
  get supportPowers(){
    return this.detail.supportPowers
  }

  get supportInnovation() {
    return this.detail.supportInnovation || !this.isConnected()
  }

  get supportOpen() {
    return this.detail.supportOpen || !this.isConnected()
  }

  get balance() {
    return this.detail.balance
  }

  get balanceUnit() {
    return this.detail.unit && this.detail.unit.toUpperCase()
  }

  get blockExploreUrl(){
    return this.detail && this.detail.metamask && this.detail.metamask.blockExplorerUrls && this.detail.metamask.blockExplorerUrls.length > 0 && this.detail.metamask.blockExplorerUrls[0]
  }

  get supportClaimXVS(){
    return this.detail && this.detail.chainId === 56 || this.detail.chainId === 97
  }


}

export default Wallet;