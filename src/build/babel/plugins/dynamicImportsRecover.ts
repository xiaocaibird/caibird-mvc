/**
 * @Owners linrui
 * @Title babelrc plugin dynamic-imports-recover
 */
import type { NodePath, Visitor } from '@babel/core';
import type * as Types from '@babel/types';

export default (api: { types: typeof Types }): { name: string, visitor: Visitor<{
    filename: string,
}> } => {
    const { types: { isIdentifier } } = api;
    return {
        name: 'dynamic-imports-recover',
        visitor: {
            CallExpression: (path, state) => {
                const callee = path.node.callee;
                if (!state.filename.includes('server') && ((path.node.type === 'CallExpression'
                    && callee.type === 'MemberExpression'
                    && isIdentifier(callee.property, { name: '__importStar' })
                    && path.parentPath.type === 'ArrowFunctionExpression') || (
                    path.node.type === 'CallExpression'
                    && isIdentifier(callee, { name: '__importStar' })
                    && path.parentPath.type === 'ArrowFunctionExpression'
                ))) {
                    const arg = path.node.arguments[0];
                    if (arg) {
                        if (arg.type === 'CallExpression') {
                            const parentPath = path.parentPath.parentPath as unknown as NodePath<Types.CallExpression>;
                            if (parentPath && parentPath.type === 'CallExpression') {
                                parentPath.node.callee.type = 'Import';
                                parentPath.node.arguments = arg.arguments;
                            }
                        }
                    }
                }
            },
        },
    };
};
