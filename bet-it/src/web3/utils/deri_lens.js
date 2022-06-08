const lensPropAlias = {
  vTokenB0: 'marketB0',
  vTokenETH: 'marketWETH',
  underlying: 'asset',
  underlyingSymbol: 'assetSymbol',
  underlyingPrice: 'assetPrice',
  vToken: 'market',
  vTokenSymbol: 'marketSymbol',
  vTokenBalance: 'assetBalance',
}
export const getLensPropAlias = (prop, obj) => {
  const newProp = lensPropAlias[prop]
  if (newProp && obj[newProp] != null) {
    return obj[newProp]
  }
  return obj[prop]
}