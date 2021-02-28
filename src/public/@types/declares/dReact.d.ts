/**
 * @Creater cmZhou
 * @Desc react 常用类型
 */
declare namespace dReact {
    type State = never;
    type Props = { children?: React.ReactNode };

    type GetProps<TComponent extends React.Component | React.ComponentType | React.FunctionComponent> =
        TComponent extends React.Component<infer Props> ? Props :
        TComponent extends React.ComponentType<infer Props> ? Props :
        TComponent extends React.FunctionComponent<infer Props> ? Props :
        TComponent extends React.MemoExoticComponent<React.FunctionComponent<infer Props>> ? Props : never;

    type GetState<TComponent extends React.Component | React.ComponentClass> =
        // eslint-disable-next-line @typescript-eslint/ban-types
        TComponent extends React.Component<{}, infer State> ? State : TComponent extends React.ComponentClass<{}, infer State> ? State : never;
}
