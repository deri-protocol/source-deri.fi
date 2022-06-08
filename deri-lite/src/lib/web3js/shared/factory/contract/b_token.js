import { factory } from '../../utils/factory';
import { BToken } from '../../contract/b_token';
import { TERC20 } from '../../contract/TERC20';

export const bTokenFactory = factory(BToken);
export const TERC20Factory = factory(TERC20)