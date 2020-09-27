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

    public readonly withAsync = <T extends object>(importComponent?: dp.PromiseFunc<any[], { default: React.ComponentType<T> }>) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.Component<T, { Component: null | React.ComponentType<T> }> {
            private static _displayName = 'withAsync';
            public static get displayName() {
                return With._displayName;
            }

            constructor(props: T) {
                super(props);

                this.state = {
                    Component: null
                };
            }

            public render() {
                const { Component } = this.state;

                return Component ? <Component {...this.props} /> : null;
            }

            public async componentDidMount() {
                if (importComponent) {
                    const { default: Component } = await importComponent();

                    With._displayName = createHocDisplayName('withAsync', Component);

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

    public readonly createHocDisplayName = (hocName: string, WrappedComponent: React.ComponentType<any>) =>
        `${hocName}(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
}
