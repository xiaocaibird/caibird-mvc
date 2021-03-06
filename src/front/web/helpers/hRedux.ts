/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { HRedux as base } from '../../@common/helpers/hRedux';

export abstract class HRedux<TState extends dp.Obj, TActions extends dRedux.BaseActions = dRedux.BaseActions> extends base<TState, TActions> {

}
