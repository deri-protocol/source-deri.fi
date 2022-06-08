import { calculateDpmmPrice, calculateDpmmCost, calculateK } from '../calc';
const TIMEOUT = 20000;

describe('calc', () => {
  it(
    'calulateK',
    async () => {
      const res = calculateK('365.7', '1059.81', '2.3');
      expect(res.toString()).toEqual('0.793642256630905539');
    },
    TIMEOUT
  );
  it(
    'calulateDpmmPrice',
    async () => {
      const res = calculateDpmmPrice(
        '356.7',
        '0.793642256630905539',
        '37',
        '0.01'
      );
      expect(res.toString()).toEqual('461.444111387890282131681');
    },
    TIMEOUT
  );
  it(
    'calulateDpmmCost',
    async () => {
      const res = calculateDpmmCost(
        '356.7',
        '0.793642256630905539',
        '37',
        '0.01',
        '9'
      );
      expect(res.toString()).toEqual('42.6764934063181133007');
    },
    TIMEOUT
  );
});
