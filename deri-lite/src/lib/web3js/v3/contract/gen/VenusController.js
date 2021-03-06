// this file is generated by script, don't modify it !!!
import { ContractBase } from '../../../shared/contract/contract_base.js'
import { deleteIndexedKey } from '../../../shared/utils/web3.js'
import { venusControllerAbi } from '../abi/venusControllerAbi.js'

export class VenusController extends ContractBase {
  // init
  constructor(chainId, contractAddress, opts = {}) {
    super(chainId, contractAddress, venusControllerAbi)
    // for pool use
    this.initialBlock = opts.initialBlock || ""
  }

  // query
  // async _borrowGuardianPaused() {
  //   const res = await this._call('_borrowGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async _mintGuardianPaused() {
  //   const res = await this._call('_mintGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async accountAssets(, ) {
  //   const res = await this._call('accountAssets', [, ])
  //   return deleteIndexedKey(res)
  // }
  async admin() {
    const res = await this._call('admin', [])
    return deleteIndexedKey(res)
  }
  // async allMarkets() {
  //   const res = await this._call('allMarkets', [])
  //   return deleteIndexedKey(res)
  // }
  // async borrowCapGuardian() {
  //   const res = await this._call('borrowCapGuardian', [])
  //   return deleteIndexedKey(res)
  // }
  // async borrowCaps() {
  //   const res = await this._call('borrowCaps', [])
  //   return deleteIndexedKey(res)
  // }
  // async borrowGuardianPaused() {
  //   const res = await this._call('borrowGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async checkMembership(account, vToken) {
  //   const res = await this._call('checkMembership', [account, vToken])
  //   return deleteIndexedKey(res)
  // }
  // async closeFactorMantissa() {
  //   const res = await this._call('closeFactorMantissa', [])
  //   return deleteIndexedKey(res)
  // }
  // async comptrollerImplementation() {
  //   const res = await this._call('comptrollerImplementation', [])
  //   return deleteIndexedKey(res)
  // }
  // async getAccountLiquidity(account) {
  //   const res = await this._call('getAccountLiquidity', [account])
  //   return deleteIndexedKey(res)
  // }
  // async getAllMarkets() {
  //   const res = await this._call('getAllMarkets', [])
  //   return deleteIndexedKey(res)
  // }
  // async getAssetsIn(account) {
  //   const res = await this._call('getAssetsIn', [account])
  //   return deleteIndexedKey(res)
  // }
  // async getBlockNumber() {
  //   const res = await this._call('getBlockNumber', [])
  //   return deleteIndexedKey(res)
  // }
  // async getHypotheticalAccountLiquidity(account, vTokenModify, redeemTokens, borrowAmount) {
  //   const res = await this._call('getHypotheticalAccountLiquidity', [account, vTokenModify, redeemTokens, borrowAmount])
  //   return deleteIndexedKey(res)
  // }
  // async getXVSAddress() {
  //   const res = await this._call('getXVSAddress', [])
  //   return deleteIndexedKey(res)
  // }
  // async isComptroller() {
  //   const res = await this._call('isComptroller', [])
  //   return deleteIndexedKey(res)
  // }
  // async liquidateCalculateSeizeTokens(vTokenBorrowed, vTokenCollateral, actualRepayAmount) {
  //   const res = await this._call('liquidateCalculateSeizeTokens', [vTokenBorrowed, vTokenCollateral, actualRepayAmount])
  //   return deleteIndexedKey(res)
  // }
  // async liquidateVAICalculateSeizeTokens(vTokenCollateral, actualRepayAmount) {
  //   const res = await this._call('liquidateVAICalculateSeizeTokens', [vTokenCollateral, actualRepayAmount])
  //   return deleteIndexedKey(res)
  // }
  // async liquidationIncentiveMantissa() {
  //   const res = await this._call('liquidationIncentiveMantissa', [])
  //   return deleteIndexedKey(res)
  // }
  // async markets() {
  //   const res = await this._call('markets', [])
  //   return deleteIndexedKey(res)
  // }
  // async maxAssets() {
  //   const res = await this._call('maxAssets', [])
  //   return deleteIndexedKey(res)
  // }
  // async minReleaseAmount() {
  //   const res = await this._call('minReleaseAmount', [])
  //   return deleteIndexedKey(res)
  // }
  // async mintGuardianPaused() {
  //   const res = await this._call('mintGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async mintVAIGuardianPaused() {
  //   const res = await this._call('mintVAIGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async mintedVAIs() {
  //   const res = await this._call('mintedVAIs', [])
  //   return deleteIndexedKey(res)
  // }
  // async oracle() {
  //   const res = await this._call('oracle', [])
  //   return deleteIndexedKey(res)
  // }
  // async pauseGuardian() {
  //   const res = await this._call('pauseGuardian', [])
  //   return deleteIndexedKey(res)
  // }
  // async pendingAdmin() {
  //   const res = await this._call('pendingAdmin', [])
  //   return deleteIndexedKey(res)
  // }
  // async pendingComptrollerImplementation() {
  //   const res = await this._call('pendingComptrollerImplementation', [])
  //   return deleteIndexedKey(res)
  // }
  // async protocolPaused() {
  //   const res = await this._call('protocolPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async releaseStartBlock() {
  //   const res = await this._call('releaseStartBlock', [])
  //   return deleteIndexedKey(res)
  // }
  // async repayVAIGuardianPaused() {
  //   const res = await this._call('repayVAIGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async seizeGuardianPaused() {
  //   const res = await this._call('seizeGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async transferGuardianPaused() {
  //   const res = await this._call('transferGuardianPaused', [])
  //   return deleteIndexedKey(res)
  // }
  // async treasuryAddress() {
  //   const res = await this._call('treasuryAddress', [])
  //   return deleteIndexedKey(res)
  // }
  // async treasuryGuardian() {
  //   const res = await this._call('treasuryGuardian', [])
  //   return deleteIndexedKey(res)
  // }
  // async treasuryPercent() {
  //   const res = await this._call('treasuryPercent', [])
  //   return deleteIndexedKey(res)
  // }
  // async vaiController() {
  //   const res = await this._call('vaiController', [])
  //   return deleteIndexedKey(res)
  // }
  // async vaiMintRate() {
  //   const res = await this._call('vaiMintRate', [])
  //   return deleteIndexedKey(res)
  // }
  // async vaiVaultAddress() {
  //   const res = await this._call('vaiVaultAddress', [])
  //   return deleteIndexedKey(res)
  // }
  async venusAccrued(address) {
    const res = await this._call('venusAccrued', [address])
    return deleteIndexedKey(res)
  }
  async venusBorrowState(address) {
    const res = await this._call('venusBorrowState', [address])
    return deleteIndexedKey(res)
  }
  async venusBorrowerIndex(vTokenAddress, address) {
    const res = await this._call('venusBorrowerIndex', [vTokenAddress, address])
    return deleteIndexedKey(res)
  }
  async venusInitialIndex() {
    const res = await this._call('venusInitialIndex', [])
    return deleteIndexedKey(res)
  }
  // async venusRate() {
  //   const res = await this._call('venusRate', [])
  //   return deleteIndexedKey(res)
  // }
  // async venusSpeeds() {
  //   const res = await this._call('venusSpeeds', [])
  //   return deleteIndexedKey(res)
  // }
  async venusSupplierIndex(vTokenAddress, address) {
    const res = await this._call('venusSupplierIndex', [vTokenAddress, address])
    return deleteIndexedKey(res)
  }
  async venusSupplyState(address) {
    const res = await this._call('venusSupplyState', [address])
    return deleteIndexedKey(res)
  }
  // async venusVAIRate() {
  //   const res = await this._call('venusVAIRate', [])
  //   return deleteIndexedKey(res)
  // }
  // async venusVAIVaultRate() {
  //   const res = await this._call('venusVAIVaultRate', [])
  //   return deleteIndexedKey(res)
  // }

  // tx
  // async _become(accountAddress, unitroller) {
  //   return await this._transact('_become', [unitroller], accountAddress)
  // }
  // async _setBorrowCapGuardian(accountAddress, newBorrowCapGuardian) {
  //   return await this._transact('_setBorrowCapGuardian', [newBorrowCapGuardian], accountAddress)
  // }
  // async _setCloseFactor(accountAddress, newCloseFactorMantissa) {
  //   return await this._transact('_setCloseFactor', [newCloseFactorMantissa], accountAddress)
  // }
  // async _setCollateralFactor(accountAddress, vToken, newCollateralFactorMantissa) {
  //   return await this._transact('_setCollateralFactor', [vToken, newCollateralFactorMantissa], accountAddress)
  // }
  // async _setLiquidationIncentive(accountAddress, newLiquidationIncentiveMantissa) {
  //   return await this._transact('_setLiquidationIncentive', [newLiquidationIncentiveMantissa], accountAddress)
  // }
  // async _setMarketBorrowCaps(accountAddress, vTokens, newBorrowCaps) {
  //   return await this._transact('_setMarketBorrowCaps', [vTokens, newBorrowCaps], accountAddress)
  // }
  // async _setPriceOracle(accountAddress, newOracle) {
  //   return await this._transact('_setPriceOracle', [newOracle], accountAddress)
  // }
  // async _setProtocolPaused(accountAddress, state) {
  //   return await this._transact('_setProtocolPaused', [state], accountAddress)
  // }
  // async _setTreasuryData(accountAddress, newTreasuryGuardian, newTreasuryAddress, newTreasuryPercent) {
  //   return await this._transact('_setTreasuryData', [newTreasuryGuardian, newTreasuryAddress, newTreasuryPercent], accountAddress)
  // }
  // async _setVAIController(accountAddress, vaiController_) {
  //   return await this._transact('_setVAIController', [vaiController_], accountAddress)
  // }
  // async _setVAIMintRate(accountAddress, newVAIMintRate) {
  //   return await this._transact('_setVAIMintRate', [newVAIMintRate], accountAddress)
  // }
  // async _setVAIVaultInfo(accountAddress, vault_, releaseStartBlock_, minReleaseAmount_) {
  //   return await this._transact('_setVAIVaultInfo', [vault_, releaseStartBlock_, minReleaseAmount_], accountAddress)
  // }
  // async _setVenusSpeed(accountAddress, vToken, venusSpeed) {
  //   return await this._transact('_setVenusSpeed', [vToken, venusSpeed], accountAddress)
  // }
  // async _setVenusVAIRate(accountAddress, venusVAIRate_) {
  //   return await this._transact('_setVenusVAIRate', [venusVAIRate_], accountAddress)
  // }
  // async _setVenusVAIVaultRate(accountAddress, venusVAIVaultRate_) {
  //   return await this._transact('_setVenusVAIVaultRate', [venusVAIVaultRate_], accountAddress)
  // }
  // async _supportMarket(accountAddress, vToken) {
  //   return await this._transact('_supportMarket', [vToken], accountAddress)
  // }
  // async borrowAllowed(accountAddress, vToken, borrower, borrowAmount) {
  //   return await this._transact('borrowAllowed', [vToken, borrower, borrowAmount], accountAddress)
  // }
  // async borrowVerify(accountAddress, vToken, borrower, borrowAmount) {
  //   return await this._transact('borrowVerify', [vToken, borrower, borrowAmount], accountAddress)
  // }
  // async claimVenus(accountAddress, holder, vTokens) {
  //   return await this._transact('claimVenus', [holder, vTokens], accountAddress)
  // }
  // async claimVenus(accountAddress, holder) {
  //   return await this._transact('claimVenus', [holder], accountAddress)
  // }
  // async claimVenus(accountAddress, holders, vTokens, borrowers, suppliers) {
  //   return await this._transact('claimVenus', [holders, vTokens, borrowers, suppliers], accountAddress)
  // }
  // async distributeVAIMinterVenus(accountAddress, vaiMinter) {
  //   return await this._transact('distributeVAIMinterVenus', [vaiMinter], accountAddress)
  // }
  // async enterMarkets(accountAddress, vTokens) {
  //   return await this._transact('enterMarkets', [vTokens], accountAddress)
  // }
  // async exitMarket(accountAddress, vTokenAddress) {
  //   return await this._transact('exitMarket', [vTokenAddress], accountAddress)
  // }
  // async liquidateBorrowAllowed(accountAddress, vTokenBorrowed, vTokenCollateral, liquidator, borrower, repayAmount) {
  //   return await this._transact('liquidateBorrowAllowed', [vTokenBorrowed, vTokenCollateral, liquidator, borrower, repayAmount], accountAddress)
  // }
  // async liquidateBorrowVerify(accountAddress, vTokenBorrowed, vTokenCollateral, liquidator, borrower, actualRepayAmount, seizeTokens) {
  //   return await this._transact('liquidateBorrowVerify', [vTokenBorrowed, vTokenCollateral, liquidator, borrower, actualRepayAmount, seizeTokens], accountAddress)
  // }
  // async mintAllowed(accountAddress, vToken, minter, mintAmount) {
  //   return await this._transact('mintAllowed', [vToken, minter, mintAmount], accountAddress)
  // }
  // async mintVerify(accountAddress, vToken, minter, actualMintAmount, mintTokens) {
  //   return await this._transact('mintVerify', [vToken, minter, actualMintAmount, mintTokens], accountAddress)
  // }
  // async redeemAllowed(accountAddress, vToken, redeemer, redeemTokens) {
  //   return await this._transact('redeemAllowed', [vToken, redeemer, redeemTokens], accountAddress)
  // }
  // async redeemVerify(accountAddress, vToken, redeemer, redeemAmount, redeemTokens) {
  //   return await this._transact('redeemVerify', [vToken, redeemer, redeemAmount, redeemTokens], accountAddress)
  // }
  // async releaseToVault(accountAddress) {
  //   return await this._transact('releaseToVault', [], accountAddress)
  // }
  // async repayBorrowAllowed(accountAddress, vToken, payer, borrower, repayAmount) {
  //   return await this._transact('repayBorrowAllowed', [vToken, payer, borrower, repayAmount], accountAddress)
  // }
  // async repayBorrowVerify(accountAddress, vToken, payer, borrower, actualRepayAmount, borrowerIndex) {
  //   return await this._transact('repayBorrowVerify', [vToken, payer, borrower, actualRepayAmount, borrowerIndex], accountAddress)
  // }
  // async seizeAllowed(accountAddress, vTokenCollateral, vTokenBorrowed, liquidator, borrower, seizeTokens) {
  //   return await this._transact('seizeAllowed', [vTokenCollateral, vTokenBorrowed, liquidator, borrower, seizeTokens], accountAddress)
  // }
  // async seizeVerify(accountAddress, vTokenCollateral, vTokenBorrowed, liquidator, borrower, seizeTokens) {
  //   return await this._transact('seizeVerify', [vTokenCollateral, vTokenBorrowed, liquidator, borrower, seizeTokens], accountAddress)
  // }
  // async setMintedVAIOf(accountAddress, owner, amount) {
  //   return await this._transact('setMintedVAIOf', [owner, amount], accountAddress)
  // }
  // async transferAllowed(accountAddress, vToken, src, dst, transferTokens) {
  //   return await this._transact('transferAllowed', [vToken, src, dst, transferTokens], accountAddress)
  // }
  // async transferVerify(accountAddress, vToken, src, dst, transferTokens) {
  //   return await this._transact('transferVerify', [vToken, src, dst, transferTokens], accountAddress)
  // }

}