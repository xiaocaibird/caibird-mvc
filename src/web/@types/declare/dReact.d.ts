/**
 * @Creater cmZhou
 * @Desc react 常用类型
 */
declare namespace dReact {
    type State = never;
    type Props = { children?: React.ReactNode };

    type GetProps<TComponent extends React.Component | React.ComponentType<any> | React.FunctionComponent<any>> =
        TComponent extends React.Component<infer Props> ? Props :
        TComponent extends React.ComponentType<infer Props> ? Props :
        TComponent extends React.FunctionComponent<infer Props> ? Props :
        TComponent extends React.MemoExoticComponent<(props: infer Props) => any> ? Props : never;
}
