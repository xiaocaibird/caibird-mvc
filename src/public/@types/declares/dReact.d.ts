/**
 * @Creater cmZhou
 * @Desc react 常用类型
 */
declare namespace dReact {
    type State = never;
    type Props = { children?: React.ReactNode };

    type GetProps<TComponent extends React.Component<unknown, unknown> | React.ComponentType<unknown> | React.FunctionComponent<unknown>> =
        TComponent extends React.Component<infer Props> ? Props :
        TComponent extends React.ComponentType<infer Props> ? Props :
        TComponent extends React.FunctionComponent<infer Props> ? Props :
        TComponent extends React.MemoExoticComponent<(props: infer Props) => unknown> ? Props : never;

    type GetState<TComponent extends React.Component<unknown, unknown> | React.ComponentClass<unknown, unknown>> =
        TComponent extends React.Component<unknown, infer State> ? State :
        TComponent extends React.ComponentClass<unknown, infer State> ? State : never;
}
