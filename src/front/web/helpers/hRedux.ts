/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { HRedux as base } from '../../@common/helpers/hRedux';

export abstract class HRedux<TState, TActions extends dRedux.BaseActions = dRedux.BaseActions> extends base<TState, TActions> {

}
