/**
 * @Creater cmZhou
 * @Desc redux helper
 */
import { HRedux as base } from '../../@common/helpers/hRedux';

export abstract class HRedux<TState extends dp.Obj, TActions extends dRedux.BaseActions = dp.Obj> extends base<TState, TActions> {

}
