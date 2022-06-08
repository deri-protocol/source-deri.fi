
import {getUserWalletBalance ,DeriEnv,connectWallet, isUnlocked,openConfigListCache, unlock } from "../lib/web3js/indexV2";
import config from '../config.json'
import { formatBalance, eqInNumber, storeChain } from "../utils/utils";
import { observable, computed, action, makeAutoObservable } from "mobx";
import version from './Version'

class Wallet {
  
  detail = {}
  defaultNw = {}
  
  constructor(){
    makeAutoObservable(this,{
      detail : observable,
      defaultNw : observable,
      setDefaultNw : action,
      setDetail : action,
      supportV2 : computed,
      supportV1 : computed,
      supportAllVersion : computed,
      supportChain : computed,
      supportInnocation : computed,
      supportOpen : computed
    })
  }

  supportWeb3 = () => !!window.ethereum

  isConnected = () => !!this.detail.account;


  async isApproved(pool,bTokenId){
    if(this.detail.chainId && this.supportChain){
      if(version.isOpen){
        await openConfigListCache.update()
      }
      const isApproved = await isUnlocked(this.detail.chainId,pool,this.detail.account,bTokenId).catch(e => console.error('load approve error'))
      this.detail.isApproved = isApproved;
      this.setDetail(this.detail)
      return isApproved;
    }
  }

  approve = async (pool,bTokenId) => {
    if(this.detail.chainId){
      const approved = await unlock(this.detail.chainId,pool,this.detail.account,bTokenId);
      return approved
    }
  }

  connect =  async () => {
    const res = await connectWallet();
    return new Promise(async (resolve,reject) => {
      if(res.success){
        const {chainId,account} = res
        const wallet = await this.loadWalletBalance(chainId,account);      
        resolve(wallet)
      } else {
        reject(null)
      }
    })
  }

  switchNetwork = async (network) => {
    if(!this.isConnected()){
      this.connect();
    }
    const chainInfo = config[DeriEnv.get()]['chainInfo']
    const chainId =`0x${(parseInt(network.id)).toString(16)}`
    network = chainInfo[parseInt(network.id)]
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId}],
      });
    } catch (error) {
      // alert('err' + JSON.stringify(error))
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{chainId,...network.metamask}],
          });
        } catch (addError) {
          console.error('err' ,addError)
        }
      }
    }
  }

  loadWalletBalance = async (chainId,account) => {
    if(version.isOpen){
      await openConfigListCache.update()
    }
    const balance = await getUserWalletBalance(chainId,account).catch(e => console.log('wallet account is not exist'))
    const detail = {chainId,account,balance,formatBalance : formatBalance(balance)}
    const env = DeriEnv.get();
    const {chainInfo} = config[env]
    
    if(chainInfo[chainId]){
      Object.assign(detail,{...chainInfo[chainId],supported : true})
      storeChain(chainInfo[chainId])
    }
    this.setDetail(detail)
    return detail;
  }

  get = () => {
    return this.detail;
  }

  setDetail(detail){
    this.detail = detail;
  }

  setDefaultNw(network){
    this.defaultNw = network
  }

  refresh(){
    this.loadWalletBalance(this.detail.chainId,this.detail.account);
  }

  isSupportChain(isOptions){
    const chainId = this.detail.chainId
    const env = DeriEnv.get();
    const {chainInfo} = config[env]
    if(isOptions){
      return chainInfo[chainId] && chainInfo[chainId]['supportOptions']
    } else {
      return this.supportChain
    }
  }

  get supportV2() {
    return this.detail.supportV2
  }

  get supportV1(){
    return this.detail.supportV1;
  }

  get supportAllVersion(){
    return this.detail.supportV1 && this.detail.supportV2
  }

  get supportChain(){
    return this.detail.supported
  }

  get supportInnovation(){
    return this.detail.supportInnovation || !this.isConnected()
  }

  get supportOpen(){
    return this.detail.supportOpen || !this.isConnected()
  }


}

export default Wallet;