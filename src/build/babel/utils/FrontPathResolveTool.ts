/**
 * @Owners cmZhou
 * @Title FrontPathResolveTool 配置
 */
import find from 'find';
import path from 'path';

export default class FrontPathResolveTool {
    public constructor(private readonly options: {
        platform: 'web',
    }) {
    }

    private readonly pathMap: dp.Obj<dp.Obj<string | undefined>> = {};

    private readonly getPath = (library: string, name: string) => {
        if (!this.pathMap[library]) {
            this.pathMap[library] = {};
        }
        return this.pathMap[library][name];
    };

    private readonly handlePathResult = (result: string | undefined, library: string, name: string) => {
        if (!result) {
            throw new Error(`${library} 下找不到 ${name}`);
        }

        this.pathMap[library][name] = result;
        return result;
    };

    private readonly getCustomName = (projectName: string, libraryName: string, dirName: string) => (name: string) => {
        let result = this.getPath(libraryName, name);

        if (result) return result;

        try {
            const filePath = path.join(process.cwd(), `/dist/${projectName}/front/${this.options.platform}/${dirName}/${name}`);
            require.resolve(filePath);
            result = `${libraryName}/${name}`;
        } catch {
            try {
                const caibirdPath = path.join(process.cwd(), `/dist/@modules/caibird-mvc/src/front/${this.options.platform}/${dirName}/${name}`);
                require.resolve(caibirdPath);
                result = `caibird-mvc/front/${this.options.platform}/${dirName}/${name}`;
            } catch {
                result = `${projectName}-public-${dirName}/${name}`; // TODO front @common
            }
        }
        return this.handlePathResult(result, libraryName, name);
    };

    private readonly getComponentCustomName = (projectName: string, libraryName: string) => (name: string) => {
        let result = this.getPath(libraryName, name);

        if (result) return result;

        const realPath = path.join(process.cwd(), `/dist/${projectName}/front/${this.options.platform}/pages/@components`);
        try {
            require.resolve(`${realPath}/${name}`);
            result = `${libraryName}/${name}`;
        } catch {
            let deepPaths = find.fileSync(new RegExp(`${name}\.js$`), realPath).filter(item => !item.includes('@jss'));

            if (deepPaths.length === 0) {
                deepPaths = find.dirSync(new RegExp(name), realPath).filter(item => !item.includes('@jss'));
            }

            const relativePath = path.relative(realPath, deepPaths[0]).replace(/\\/g, '/');

            result = `${libraryName}/${relativePath.endsWith('.js') ? relativePath.slice(0, relativePath.length - 3) : relativePath}`;
        }
        return this.handlePathResult(result, libraryName, name);
    };

    public readonly getImportBabelPlugin = (projectName: string, dirName: string) => {
        const libraryName = `${projectName}-${this.options.platform}-${dirName}`;
        let customName: ((name: string) => string) | undefined = undefined;
        if (dirName === 'components') {
            customName = this.getComponentCustomName(projectName, libraryName);
        } else if (dirName === 'utils' || dirName === 'consts') {
            customName = this.getCustomName(projectName, libraryName, dirName);
        }
        return ['import', {
            libraryName,
            libraryDirectory: '',
            camel2DashComponentName: false,
            customName,
        }, libraryName];
    };
}
