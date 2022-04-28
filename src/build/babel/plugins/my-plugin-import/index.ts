/**
* @Owners cqs
* @Title base babel 配置
*/
import assert from 'assert';
import type * as Types from '@babel/types';

import Plugin from './plugin';
import { NodePath, Visitor } from '@babel/core';

export default (api: { types: typeof Types }) => {
    let plugins: Plugin[] | null = null;
    const { types } = api;

    function applyInstance(method: keyof Plugin, args: any, context: any) {
        if (!plugins) return;
        for (const plugin of plugins) {
            if (plugin[method]) {
                (plugin[method] as unknown as Function).apply(plugin, [...args, context]);
            }
        }
    }

    type options = {
        libraryName: string,
        libraryDirectory: string,
        style: string,
        styleLibraryDirectory: string,
        customStyleName: string,
        camel2DashComponentName: string,
        camel2UnderlineComponentName: string,
        fileName: string,
        customName: string,
        transformToDefaultImport: boolean,
    }

    const Program = {
        enter(_path: NodePath, { opts = [] }: {
            opts: options | options[]
        }) {
            // Init plugin instances once.
            if (!plugins) {
                if (Array.isArray(opts)) {
                    plugins = opts.map(
                        (
                            {
                                libraryName,
                                libraryDirectory,
                                style,
                                styleLibraryDirectory,
                                customStyleName,
                                camel2DashComponentName,
                                camel2UnderlineComponentName,
                                fileName,
                                customName,
                                transformToDefaultImport,
                            },
                            index,
                        ) => {
                            assert(libraryName, 'libraryName should be provided');
                            return new Plugin(
                                libraryName,
                                libraryDirectory,
                                style,
                                styleLibraryDirectory,
                                customStyleName,
                                camel2DashComponentName,
                                camel2UnderlineComponentName,
                                fileName,
                                customName,
                                transformToDefaultImport,
                                types,
                                index,
                            );
                        },
                    );
                } else {
                    plugins = [
                        new Plugin(
                            opts.libraryName,
                            opts.libraryDirectory,
                            opts.style,
                            opts.styleLibraryDirectory,
                            opts.customStyleName,
                            opts.camel2DashComponentName,
                            opts.camel2UnderlineComponentName,
                            opts.fileName,
                            opts.customName,
                            opts.transformToDefaultImport,
                            types,
                        ),
                    ];
                }
            }
            applyInstance('ProgramEnter', arguments, this);
        },
        exit() {
            applyInstance('ProgramExit', arguments, this);
        },
    } as unknown as Visitor['Program'];

    const methods = [
        'ImportDeclaration',
        'CallExpression',
        'MemberExpression',
        'Property',
        'VariableDeclarator',
        'ArrayExpression',
        'LogicalExpression',
        'ConditionalExpression',
        'IfStatement',
        'ExpressionStatement',
        'ReturnStatement',
        'ExportDefaultDeclaration',
        'BinaryExpression',
        'NewExpression',
        'ClassDeclaration',
        'SwitchStatement',
        'SwitchCase',
    ];

    const ret: {
        [key: string]: any,
    } = {
        visitor: { Program },
    };


    for (const method of methods) {
        ret.visitor[method] = function () {
            applyInstance(method as keyof Plugin, arguments, ret.visitor);
        };
    }

    return ret;
}
 