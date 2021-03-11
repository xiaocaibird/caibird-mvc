/**
 * @Owners cmZhou
 * @Title babelrc plugin hRequest-api-replace
 */
import type { Visitor } from '@babel/core';
import type * as Types from '@babel/types';

export default (opt: { types: typeof Types }): { name: string, visitor: Visitor } => {
    const { types: { identifier, stringLiteral, isIdentifier, isStringLiteral } } = opt;
    return {
        name: 'hRequest-api-replace',
        visitor: {
            Identifier: path => {
                const node = path.node;
                const parentNode = path.parentPath.node;
                if (node.name === 'api' && parentNode.type === 'MemberExpression') {
                    if (parentNode.object.type === 'MemberExpression' && parentNode.object.property.type === 'Identifier' && parentNode.object.property.name.includes('hRequest') ||
                        parentNode.object.type === 'Identifier' && parentNode.object.name.includes('hRequest')
                    ) {
                        const callExpression = path.findParent(p => p.node.type === 'CallExpression');
                        if (callExpression && callExpression.node.type === 'CallExpression') {
                            const controllerParent = path.parentPath.parentPath.node;
                            if (controllerParent.type === 'MemberExpression' && callExpression.node.callee.type === 'MemberExpression') {
                                const controller = controllerParent.property;
                                const action = callExpression.node.callee.property;
                                if (isIdentifier(controller) && isIdentifier(action)) {
                                    const controllerName = controller.name;
                                    const actionName = action.name;

                                    callExpression.node.arguments = [stringLiteral(controllerName), stringLiteral(actionName), ...callExpression.node.arguments];

                                    callExpression.node.callee.object = parentNode.object;
                                    callExpression.node.callee.property = identifier('handleApi');
                                }
                            }
                        }
                    }
                }
            },
            CallExpression: path => {
                // if (path.findParent(constructorMethod => {
                //     if (constructorMethod.node.type === 'ClassMethod' && isIdentifier(constructorMethod.node.key, { name: 'constructor' })) {
                //         if (constructorMethod.parentPath.findParent(HRequest => {
                //             if (HRequest.node.type === 'ClassDeclaration' && isIdentifier(HRequest.node.id, { name: 'HRequest' })) {
                //                 return true;
                //             }
                //             return false;
                //         })) {
                //             return true;
                //         }
                //     }
                //     return false;
                // })) {
                const callee = path.node.callee;
                if (callee.type === 'MemberExpression' && isIdentifier(callee.property, { name: 'defineProperty' })) {
                    const arg1 = path.node.arguments[1];
                    const arg2 = path.node.arguments[2];
                    if (arg1 && arg2) {
                        if (isStringLiteral(arg1, { value: 'api' }) && arg2.type === 'ObjectExpression') {
                            if (arg2.properties.find(prop => {
                                if (prop.type === 'ObjectProperty' && isIdentifier(prop.key, { name: 'value' }) && prop.value.type === 'NewExpression') {
                                    if (isIdentifier(prop.value.callee, { name: 'Proxy' })) {
                                        return true;
                                    }
                                }
                                return false;
                            })) {
                                path.remove();
                            }
                        }
                    }
                }
            },
            // }
        },
    };
};
