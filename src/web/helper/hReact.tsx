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

    public readonly withAsync = <T extends React.ComponentType<any>>(importComponent: dp.PromiseFunc<any[], { default: T }>, displayName?: string) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.PureComponent<dReact.GetProps<T> & { onAsyncInnerDidMount?(): void }, { Component?: T; isClassComponent?: boolean }> {
            private static inner?: T;

            public static displayName = displayName || createHocDisplayName('withAsync');

            constructor(props: dReact.GetProps<T>) {
                super(props);

                this.state = {
                    Component: With.inner,
                    isClassComponent: uFunction.checkExtendsClass(With.inner, React.Component)
                };
            }

            private isCallOnInnerDidMount = false;

            public readonly innerRef = createRef<React.ReactInstance>();

            private readonly onAsyncInnerDidMount = () => {
                const { onAsyncInnerDidMount } = this.props;
                const { Component } = this.state;
                if (Component && !this.isCallOnInnerDidMount) {
                    onAsyncInnerDidMount && onAsyncInnerDidMount();
                    this.isCallOnInnerDidMount = true;
                }
            }

            public render() {
                const { Component, isClassComponent } = this.state;

                return Component ?
                    isClassComponent ? <Component ref={this.innerRef} {...this.props as any} /> :
                        <Component {...this.props as any} /> : null;
            }

            public async componentDidMount() {
                setTimeout(this.onAsyncInnerDidMount, 0); // TODO 如果不用setTimeout，findDOMNode会找不到dom
                if (!With.inner) {
                    const Component = (await importComponent()).default;
                    With.inner = Component;

                    const isClassComponent = uFunction.checkExtendsClass(Component, React.Component);

                    this.setState({
                        Component,
                        isClassComponent
                    });
                }
            }

            public componentDidUpdate() {
                this.onAsyncInnerDidMount();
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
