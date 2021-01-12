/**
 * @Creater cmZhou
 * @Desc redux helper
 */
import { HRedux as base } from '../../@common/helper/hRedux';

export abstract class HRedux<TState extends object, TActions extends dRedux.F.BaseActions = {}> extends base<TState, TActions> {

}
