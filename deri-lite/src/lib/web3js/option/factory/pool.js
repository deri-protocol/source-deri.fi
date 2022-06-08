import { factory } from '../../shared';
import { EverlastingOption } from '../contract/everlasting_option';
import { OptionPricer } from '../contract/option_pricer';

export const everlastingOptionFactory = factory(EverlastingOption);
export const optionPricerFactory = factory(OptionPricer);