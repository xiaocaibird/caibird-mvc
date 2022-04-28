/**
 * @Owners cqs
 * @Title base babel 配置
 */
import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import assert from 'assert';

import ImportBuilder from './import-builder';

const isModule = (path: NodePath<t.Program>) => {
    const { sourceType } = path.node;
    if (sourceType !== 'module' && sourceType !== 'script') {
        throw path.buildCodeFrameError(
            `Unknown sourceType "${sourceType}", cannot transform.`,
        );
    }

    return path.node.sourceType === 'module';
}

/**
 * A general helper classes add imports via transforms. See README for usage.
 */
export default class ImportInjector {
    constructor(path: NodePath<t.Node>, importedSource?: any, opts?: any) {
        const programPath = path.find(p => p.isProgram());
        this._programPath = programPath;
        this._programScope = programPath?.scope;
        this._hub = programPath?.hub;

        this._defaultOpts = this._applyDefaults(importedSource, opts, true);
    }

    /**
     * The path used for manipulation.
     */
    _programPath;

    /**
     * The scope used to generate unique variable names.
     */
    _programScope;

    /**
     * The file used to inject helpers and resolve paths.
     */
    _hub;

    /**
     * The default options to use with this instance when imports are added.
     */
    _defaultOpts: {
        [key: string]: any
    } = {
        importedSource: null,
        importedType: 'commonjs',
        importedInterop: 'babel',
        importingInterop: 'babel',
        ensureLiveReference: false,
        ensureNoContext: false,
        importPosition: 'before',
    };

    addSideEffect(importedSourceIn: any, opts: any) {
        return this._generateImport(
            this._applyDefaults(importedSourceIn, opts),
            false,
        );
    }

    _applyDefaults = (importedSource: any, opts: any, isInit = false) => {
        const optsList = [];
        if (typeof importedSource === 'string') {
            optsList.push({ importedSource });
            optsList.push(opts);
        } else {
            assert(!opts, 'Unexpected secondary arguments.');

            optsList.push(importedSource);
        }

        const newOpts: {
            [key: string]: any
        } = {
            ...this._defaultOpts,
        };
        for (const opts of optsList) {
            if (!opts) continue;
            Object.keys(newOpts).forEach(key => {
                if (opts[key] !== undefined) newOpts[key] = opts[key];
            });

            if (!isInit) {
                if (opts.nameHint !== undefined) newOpts.nameHint = opts.nameHint;
                if (opts.blockHoist !== undefined) newOpts.blockHoist = opts.blockHoist;
            }
        }
        return newOpts;
    }

    _generateImport(opts: any, importName: any) {
        const isDefault = importName === 'default';
        const isNamed = !!importName && !isDefault;
        const isNamespace = importName === null;

        const {
            importedSource,
            
            ensureLiveReference,
            ensureNoContext,
            nameHint,
            importPosition,

            // Not meant for  usage. Allows code that absolutely must control
            // ordering to set a specific hoist value on the import nodes.
            // This is ignored when "importPosition" is "after".
            blockHoist,
        } = opts;

        // Provide a hint for generateUidIdentifier for the local variable name
        // to use for the import, if the code will generate a simple assignment
        // to a variable.
        let name = nameHint || importName;

        const isMod = isModule(this._programPath as unknown as NodePath<t.Program>);

        if (importPosition === 'after' && !isMod) {
            throw new Error('"importPosition": "after" is only supported in modules');
        }
        const builder = new ImportBuilder(
            importedSource,
            this._programScope,
            this._hub,
        );

        builder.require();
        if (isNamespace) {
            builder.var(name || importedSource)?.wildcardInterop();
        } else if ((isDefault || isNamed) && ensureLiveReference) {
            if (isDefault) {
                name = name !== 'default' ? name : importedSource;
                builder.var(name)?.read(importName);
                builder.defaultInterop();
            } else {
                builder.var(importedSource)?.read(importName);
            }
        } else if (isDefault) {
            builder.var(name)?.defaultInterop().prop(importName);
        } else if (isNamed) {
            builder.var(name)?.prop(importName);
        }
        const { statements, resultName } = builder.done();

        this._insertStatements(statements, importPosition, blockHoist);
        if ((isDefault || isNamed) && ensureNoContext && resultName?.type !== 'Identifier') {
            return t.sequenceExpression([t.numericLiteral(0), resultName as unknown as t.Expression]);
        }
        return resultName;
    }

    _insertStatements(statements: any, importPosition: string = 'before', blockHoist = 3) {
        if (!this._programPath) return;
        const body = this._programPath.get('body') as NodePath<t.Node>[];

        if (importPosition === 'after') {
            for (let i = body.length - 1; i >= 0; i--) {
                if (body[i].isImportDeclaration()) {
                    body[i].insertAfter(statements);
                    return;
                }
            }
        } else {
            statements.forEach((node: { _blockHoist: number; }) => {
                node._blockHoist = blockHoist;
            });

            const targetPath = body.find(p => {
                // @ts-expect-error todo(flow->ts): avoid mutations
                const val = p.node._blockHoist;
                return Number.isFinite(val) && val < 4;
            });

            if (targetPath) {
                targetPath.insertBefore(statements);
                return;
            }
        }

        this._programPath.unshiftContainer('body' as unknown as never, statements);
    }
}
