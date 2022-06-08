/*
    1. Calculate the cost for user input volume
    2. Calculate the final price if user input volume is traded
*/

export function getMidPrice(tradersNetVolume, theoreticalPrice, K) {
    return theoreticalPrice * (1 + K * tradersNetVolume)
}

export function queryTradePMM(tradersNetVolume, theoreticalPrice, K, volume) {
    return theoreticalPrice * (volume + ((tradersNetVolume + volume) ** 2 - tradersNetVolume ** 2) * K / 2)
}
