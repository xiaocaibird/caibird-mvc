/**
 * @Owners cmZhou
 * @Title react helper
 */
import React, { createRef, memo } from 'react';

import { uFunction } from '../utils/uFunction';

export abstract class HReact {
    protected constructor() { }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly withAsync = <T extends React.ComponentType<any>>(importComponent: Caibird.dp.PromiseFunc<unknown[], T>, displayName?: string) => {
        const createHocDisplayName = this.createHocDisplayName;

        const With = class extends React.PureComponent<Caibird.dReact.GetProps<T> & { onAsyncInnerDidMount?(opt: { innerRef: React.RefObject<React.ReactInstance> }): void }, { Component?: T, isClassComponent?: boolean }> {
            private static inner?: T;

            public static displayName = displayName || createHocDisplayName('withAsync');

            public constructor(props: Caibird.dReact.GetProps<T>) {
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

            public override render() {
                const { Component, isClassComponent } = this.state;

                return Component ?
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    isClassComponent ? <Component ref={this.innerRef} {...this.props as any} /> : <Component {...this.props as any} /> : null;
            }

            public override async componentDidMount() {
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

            public override componentDidUpdate() {
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
