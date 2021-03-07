/**
 * @Owners cmZhou
 * @Title react 常用类型
 */
declare namespace dReact {
    type State = never;
    type Props = { children?: React.ReactNode };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type GetProps<TComponent extends React.Component | React.ComponentType | React.FunctionComponent | React.MemoExoticComponent<React.ComponentType<any>>> =
        TComponent extends React.Component<infer P> ? P :
        TComponent extends React.ComponentType<infer P> ? P :
        TComponent extends React.FunctionComponent<infer P> ? P :
        TComponent extends React.MemoExoticComponent<React.FunctionComponent<infer P>> ? P : never;

    type GetState<TComponent extends React.Component | React.ComponentClass> =
        // eslint-disable-next-line @typescript-eslint/ban-types
        TComponent extends React.Component<{}, infer S> ? S : TComponent extends React.ComponentClass<{}, infer S> ? S : never;
}
