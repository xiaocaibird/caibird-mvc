/**
 * @Creater cmZhou
 * @Desc react helper
 */
import React, { createContext, createRef, memo } from 'react';

import { uFunction } from '../util/uFunction';

export abstract class HReact<TRootContext> {
    constructor(protected readonly options: {
        defaultContext: TRootContext;
    }) { }
    public readonly rootContext = createContext(this.options.defaultContext);

    public readonly withAsync = <T extends React.ComponentType<any>>(importComponent?: dp.PromiseFunc<any[], { default: T }>, displayName?: string) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.PureComponent<dReact.GetProps<T> & { onAsyncInnerDidMount?(): void }, { Component?: T; isClassComponent?: boolean }> {
            public static displayName = displayName || createHocDisplayName('withAsync');

            constructor(props: dReact.GetProps<T>) {
                super(props);

                this.state = {
                };
            }

            private isCallOnInnerDidMount = false;

            public readonly innerRef = createRef<React.ReactInstance>();

            public render() {
                const { Component, isClassComponent } = this.state;

                return Component ?
                    isClassComponent ? <Component ref={this.innerRef} {...this.props as any} /> :
                        <Component {...this.props as any} /> : null;
            }

            public async componentDidMount() {
                if (importComponent) {
                    const { default: Component } = await importComponent();

                    const isClassComponent = uFunction.checkExtendsClass(Component, React.Component);

                    this.setState({
                        Component,
                        isClassComponent
                    });
                }
            }

            public componentDidUpdate() {
                const { onAsyncInnerDidMount } = this.props;
                const { Component } = this.state;
                if (Component && !this.isCallOnInnerDidMount) {
                    onAsyncInnerDidMount && onAsyncInnerDidMount();
                    this.isCallOnInnerDidMount = true;
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
