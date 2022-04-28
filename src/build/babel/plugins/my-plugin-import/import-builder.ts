/**
* @Owners cqs
* @Title base babel 配置
*/
import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import assert from 'assert';

/**
 * A class to track and accumulate mutations to the AST that will eventually
 * output a new require/import statement list.
 */
export default class ImportBuilder {
    constructor(importedSource: any, scope?: NodePath<t.Node>['scope'] | null, hub?: NodePath<t.Node>['hub'] | null) {
        this._scope = scope;
        this._hub = hub;
        this._importedSource = importedSource;
    }

    _importedSource;
    _statements: t.Node[] = [];
    _resultName: t.Node | null = null;

    _scope?: NodePath<t.Node>['scope'] | null = null;
    _hub?: NodePath<t.Node>['hub'] | null = null;

    done() {
        return {
            statements: this._statements,
            resultName: this._resultName,
        };
    }

    import() {
        this._statements.push(
            t.importDeclaration([], t.stringLiteral(this._importedSource)),
        );
        return this;
    }

    require() {
        this._statements.push(
            t.expressionStatement(
                t.callExpression(t.identifier('require'), [
                    t.stringLiteral(this._importedSource),
                ]),
            ),
        );
        return this;
    }

    namespace(name = 'namespace') {
        if (!this._scope) return;
        const local = this._scope.generateUidIdentifier(name);

        const statement = this._statements[this._statements.length - 1];
        assert(statement.type === 'ImportDeclaration');
        assert(statement.specifiers.length === 0);
        statement.specifiers = [t.importNamespaceSpecifier(local)];
        this._resultName = t.cloneNode(local);
        return this;
    }

    default(name: any) {
        if (!this._scope) return;
        let tmpname = this._scope.generateUidIdentifier(name);
        const statement = this._statements[this._statements.length - 1];
        assert(statement.type === 'ImportDeclaration');
        assert(statement.specifiers.length === 0);
        statement.specifiers = [t.importDefaultSpecifier(tmpname)];
        this._resultName = t.cloneNode(tmpname);
        return this;
    }

    named(name: any, importName: string) {
        if (!this._scope) return;

        if (importName === 'default') return this.default(name);

        let tmpname = this._scope.generateUidIdentifier(name);
        const statement = this._statements[this._statements.length - 1];
        assert(statement.type === 'ImportDeclaration');
        assert(statement.specifiers.length === 0);
        statement.specifiers = [t.importSpecifier(tmpname, t.identifier(importName))];
        this._resultName = t.cloneNode(tmpname);
        return this;
    }

    var(name: any) {
        if (!this._scope) return;

        let tmpname = this._scope.generateUidIdentifier(name);
        let statement = this._statements[this._statements.length - 1];
        if (statement.type !== 'ExpressionStatement') {
            assert(this._resultName);
            statement = t.expressionStatement(this._resultName as unknown as t.Expression);
            this._statements.push(statement);
        }
        this._statements[this._statements.length - 1] = t.variableDeclaration(
            'var',
            [t.variableDeclarator(tmpname, statement.expression)],
        );
        this._resultName = t.cloneNode(tmpname);
        return this;
    }

    defaultInterop() {
        return this._interop(this._hub?.addHelper('interopRequireDefault'));
    }

    wildcardInterop() {
        return this._interop(this._hub?.addHelper('interopRequireWildcard'));
    }

    _interop(callee: t.Expression) {
        const statement = this._statements[this._statements.length - 1];
        if (statement.type === 'ExpressionStatement') {
            statement.expression = t.callExpression(callee, [statement.expression]);
        } else if (statement.type === 'VariableDeclaration') {
            assert(statement.declarations.length === 1);
            statement.declarations[0].init = t.callExpression(callee, [
                statement.declarations[0].init as unknown as t.Expression,
            ]);
        } else {
            assert.fail('Unexpected type.');
        }
        return this;
    }

    prop(name: any) {
        const statement = this._statements[this._statements.length - 1];
        if (statement.type === 'ExpressionStatement') {
            statement.expression = t.memberExpression(
                statement.expression,
                t.identifier(name),
            );
        } else if (statement.type === 'VariableDeclaration') {
            assert(statement.declarations.length === 1);
            statement.declarations[0].init = t.memberExpression(
                statement.declarations[0].init as unknown as t.Expression,
                t.identifier(name),
            );
        } else {
            assert.fail('Unexpected type:' + statement.type);
        }
        return this;
    }

    read(name: any) {
        this._resultName = t.memberExpression(this._resultName as unknown as t.Expression, t.identifier(name));
    }
}
