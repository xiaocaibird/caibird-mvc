/**
 * @Owners cmZhou
 * @Title react 常用类型
 */
declare namespace Caibird.dReact {
    type State = never;
    type Props = dp.Obj;

    type GetProps<TComponent> =
        TComponent extends React.Component<infer P> ? P :
        TComponent extends React.ComponentType<infer P> ? P :
        TComponent extends React.FunctionComponent<infer P> ? P :
        TComponent extends React.MemoExoticComponent<React.FunctionComponent<infer P>> ? P : never;

    type GetState<TComponent extends React.Component | React.ComponentClass> =
        TComponent extends React.Component<{}, infer S> ? S : TComponent extends React.ComponentClass<{}, infer S> ? S : never;
}
