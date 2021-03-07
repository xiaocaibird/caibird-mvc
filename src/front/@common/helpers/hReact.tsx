/**
 * @Owners cmZhou
 * @Title react helper
 */
import React, { createContext, createRef, memo } from 'react';

import { uFunction } from '../utils/uFunction';

export abstract class HReact<TRootContext> {
    protected constructor(protected readonly options: {
        defaultContext: TRootContext,
    }) { }

    public readonly rootContext = createContext(this.options.defaultContext);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly withAsync = <T extends React.ComponentType<any>>(importComponent: dp.PromiseFunc<unknown[], T>, displayName?: string) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.PureComponent<dReact.GetProps<T> & { onAsyncInnerDidMount?(opt: { innerRef: React.RefObject<React.ReactInstance> }): void }, { Component?: T, isClassComponent?: boolean }> {
            private static inner?: T;

            public static displayName = displayName || createHocDisplayName('withAsync');

            public constructor(props: dReact.GetProps<T>) {
                super(props);

                this.state = {
                    Component: With.inner,
                    isClassComponent: uFunction.checkExtendsClass(With.inner, React.Component),
                };
            }

            private isCallOnInnerDidMount = false;

            public readonly innerRef = createRef<React.ReactInstance>();

            private readonly onAsyncInnerDidMount = () => {
                const { onAsyncInnerDidMount } = this.props;
                const { Component } = this.state;
                if (Component && !this.isCallOnInnerDidMount) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    onAsyncInnerDidMount?.({
                        innerRef: this.innerRef,
                    });
                    this.isCallOnInnerDidMount = true;
                }
            };

            public render() {
                const { Component, isClassComponent } = this.state;

                return Component ?
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    isClassComponent ? <Component ref={this.innerRef} {...this.props as any} /> : <Component {...this.props as any} /> : null;
            }

            public async componentDidMount() {
                this.onAsyncInnerDidMount();
                if (!With.inner) {
                    const Component = (await importComponent());
                    With.inner = Component;

                    const isClassComponent = uFunction.checkExtendsClass(Component, React.Component);

                    this.setState({
                        Component,
                        isClassComponent,
                    });
                }
            }

            public componentDidUpdate() {
                this.onAsyncInnerDidMount();
            }
        };

        return With;
    };

    public readonly withAutoDestroy = <TProps extends { visible?: boolean }>(Component: React.ComponentType<TProps>) => memo(
        (props: TProps) => props.visible ? <Component {...props} /> : null,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly createHocDisplayName = (hocName: string, WrappedComponent?: React.ComponentType<any>) =>
        `${hocName}(${WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name) || 'Component'})`;
}
