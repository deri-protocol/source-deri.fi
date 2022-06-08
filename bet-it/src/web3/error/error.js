export class ZeroTradeVolumeError extends Error {
  constructor() {
    super('Invalid trade volume: 0');
    this.code = 1001
  }
}