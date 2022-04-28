/**
 * @Owners cqs
 * @Title base babel 配置
 */
import { join } from 'path';
import { NodePath } from '@babel/core';
import type * as Types from '@babel/types';
import ImportInjector from "./import-injector";

const addSideEffect = (path: NodePath, importedSource: any, opts?: any) => {
    return new ImportInjector(path).addSideEffect(importedSource, opts);
}

const transCamel = (_str: string, symbol: string) => {
    const str = _str[0].toLowerCase() + _str.substr(1);
    return str.replace(/([A-Z])/g, ($1) => `${symbol}${$1.toLowerCase()}`);
}

const winPath = (path: string) => path.replace(/\\/g, "/");

const normalizeCustomName = (originCustomName: string) => {
    // If set to a string, treat it as a JavaScript source file path.
    if (typeof originCustomName === "string") {
        const customNameExports = require(originCustomName);
        return typeof customNameExports === "function"
            ? customNameExports
            : customNameExports.default;
    }

    return originCustomName;
}

type State = {
    [x: string]: any;
}

export default class Plugin {
    libraryName: string;
    libraryDirectory: string;
    camel2DashComponentName: string | boolean;
    camel2UnderlineComponentName: string;
    style: Function | string | boolean;
    styleLibraryDirectory: string;
    customStyleName: any;
    fileName: string;
    customName: any;
    transformToDefaultImport: boolean;
    types: any;
    pluginStateKey: string;
    constructor(
        libraryName: string,
        libraryDirectory: string,
        style: string | boolean,
        styleLibraryDirectory: string,
        customStyleName: string,
        camel2DashComponentName: string,
        camel2UnderlineComponentName: string,
        fileName: string,
        customName: string,
        transformToDefaultImport: boolean,
        types: typeof Types,
        index = 0
    ) {
        this.libraryName = libraryName;
        this.libraryDirectory =
            typeof libraryDirectory === 'undefined' ? 'lib' : libraryDirectory;
        this.camel2DashComponentName =
            typeof camel2DashComponentName === 'undefined'
                ? true
                : camel2DashComponentName;
        this.camel2UnderlineComponentName = camel2UnderlineComponentName;
        this.style = style || false;
        this.styleLibraryDirectory = styleLibraryDirectory;
        this.customStyleName = normalizeCustomName(customStyleName);
        this.fileName = fileName || '';
        this.customName = normalizeCustomName(customName);
        this.transformToDefaultImport =
            typeof transformToDefaultImport === 'undefined'
                ? true
                : transformToDefaultImport;
        this.types = types;
        this.pluginStateKey = `importPluginState${index}`;
    }

    getPluginState(state: State) {
        if (!state[this.pluginStateKey]) {
            state[this.pluginStateKey] = {};
        }
        return state[this.pluginStateKey];
    }

    /**
     * @desc
     * require 也调这里
     * **/
    importMethod(methodName: string, file: { path: any; }, pluginState: { selectedMethods: State; }) {
        if (!pluginState.selectedMethods[methodName]) {
            const { libraryDirectory } = this;
            const transformedMethodName = this.camel2UnderlineComponentName
                ? transCamel(methodName, '_')
                : this.camel2DashComponentName
                    ? transCamel(methodName, '-')
                    : methodName;
            const path = winPath(
                this.customName
                    ? this.customName(transformedMethodName, file)
                    : join(
                        this.libraryName,
                        libraryDirectory,
                        transformedMethodName,
                        this.fileName
                    )
            );
            addSideEffect(file.path, `${path}/style/css`);
        }
        return { ...pluginState.selectedMethods[methodName] };
    }

    ProgramEnter(_path: any, state: State) {
        const pluginState = this.getPluginState(state);
        pluginState.specified = Object.create(null);
        pluginState.libraryObjs = Object.create(null);
        pluginState.selectedMethods = Object.create(null);
        pluginState.pathsToRemove = [];
    }

    ProgramExit(_path: any, state: State) {
        this.getPluginState(state).pathsToRemove.forEach(
            (p: { removed: any; remove: () => any; }) => !p.removed && p.remove()
        );
    }

    /**
     * @desc
     * 添加导入属性
     * **/
    ImportDeclaration(path: { node: any; }, state: State) {
        const { node } = path;

        // path maybe removed by prev instances.
        if (!node) return;

        const { value } = node.source;
        const { libraryName } = this;
        const { types } = this;
        const pluginState = this.getPluginState(state);
        if (value === libraryName) {
            node.specifiers.forEach((spec: { local: { name: string | number; }; imported: { name: any; }; }) => {
                if (types.isImportSpecifier(spec)) {
                    pluginState.specified[spec.local.name] = spec.imported.name;
                } else {
                    pluginState.libraryObjs[spec.local.name] = true;
                }
            });
            pluginState.pathsToRemove.push(path);
        }
    }

    MemberExpression(path: { hub?: any; replaceWith?: any; scope?: any; node?: any; }, state: State) {
        const { node } = path;
        const file = (path && path.hub && path.hub.file) || (state && state.file);
        const pluginState = this.getPluginState(state);

        // multiple instance check.
        if (!node.object || !node.object.name) return;
        const name = node.object.name;
        const cname = name.endsWith("_1") ? name.slice(0, -2) : name;

        // property

        if (cname === this.libraryName && !(node.property.name in pluginState.specified) ) {
         
            pluginState.specified[node.property.name] = node.property.name;
            // pluginState.pathsToRemove.push(path);
            this.importMethod(node.property.name, file, pluginState);
        }
       if (
            pluginState.specified[node.object.name] &&
            path.scope.hasBinding(node.object.name)
        ) {
            const { scope } = path.scope.getBinding(node.object.name);
            // global variable in file scope
            if (scope.path.parent.type === 'File') {
                node.object = this.importMethod(
                    pluginState.specified[node.object.name],
                    file,
                    pluginState
                );
            }
        }
    }
}
