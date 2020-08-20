/**
 * Created by cmZhou
 * react 常用类型
 */
declare namespace dReact {
    type State = never;
    type Props = { children?: React.ReactNode };

    type GetClassKey<T extends import('react-jss').PropInjector<any, any>> = T extends import('react-jss').PropInjector<import('react-jss').WithSheet<infer C, any>, any> ? C extends string ? C : string : never;

    type GetClassProps<T extends import('react-jss').PropInjector<any, any>> = import('react-jss').StyledComponentProps<GetClassKey<T>>;

    type GetProps<TComponent extends React.Component | React.ComponentType<any> | React.FunctionComponent<any>> =
        TComponent extends React.Component<infer Props> ? Props :
        TComponent extends React.ComponentType<infer Props> ? Props :
        TComponent extends React.FunctionComponent<infer Props> ? Props :
        TComponent extends React.MemoExoticComponent<(props: infer Props) => any> ? Props : never;
}
