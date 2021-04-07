/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { HRedux as base } from '../../@com/helpers/hRedux';

export abstract class HRedux<TState extends dCaibird.Obj, TActions extends dRedux.BaseActions = dRedux.BaseActions> extends base<TState, TActions> {

}
