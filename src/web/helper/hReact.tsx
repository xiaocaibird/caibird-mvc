/**
 * @Creater cmZhou
 * @Desc react helper
 */
import React, { createContext, memo } from 'react';

export abstract class HReact<TRootContext> {
    constructor(protected readonly options: {
        defaultContext: TRootContext;
    }) { }
    public readonly rootContext = createContext(this.options.defaultContext);

    public readonly getAsyncComponent = (importComponent?: dp.PromiseFunc<any[], { default: React.ComponentType<any> }>) =>
        class AsyncComponent extends React.Component<object, { component: null | React.ComponentType<any> }> {
            constructor(props: object) {
                super(props);

                this.state = {
                    component: null
                };
            }

            public render() {
                const Component = this.state.component;

                return Component ? <Component {...this.props} /> : null;
            }

            public async componentDidMount() {
                if (importComponent) {
                    const { default: component } = await importComponent();

                    this.setState({
                        component
                    });
                }
            }
        }
    public readonly getAutoDestroyComponent = <TProps extends { visible?: boolean }>(Component: React.ComponentType<TProps>) => memo(
        (props: TProps) => props.visible ? <Component {...props} /> : null
    )
}
