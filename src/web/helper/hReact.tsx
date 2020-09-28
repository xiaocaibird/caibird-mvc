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

    public readonly withAsync = <T extends React.ComponentType<any>>(importComponent?: dp.PromiseFunc<any[], { default: T }>, displayName?: string) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.Component<dReact.GetProps<T>, { Component?: T }> {
            public static displayName = displayName || createHocDisplayName('withAsync');

            constructor(props: dReact.GetProps<T>) {
                super(props);

                this.state = {
                };
            }

            public render() {
                const { Component } = this.state;

                return Component ? <Component {...this.props as any} /> : null;
            }

            public async componentDidMount() {
                if (importComponent) {
                    const { default: Component } = await importComponent();

                    this.setState({
                        Component
                    });
                }
            }
        };

        return With;
    }

    public readonly withAutoDestroy = <TProps extends { visible?: boolean }>(Component: React.ComponentType<TProps>) => memo(
        (props: TProps) => props.visible ? <Component {...props} /> : null
    )

    public readonly createHocDisplayName = (hocName: string, WrappedComponent?: React.ComponentType<any>) =>
        `${hocName}(${WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name) || 'Component'})`
}
