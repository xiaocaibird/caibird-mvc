/**
 * @Creater cmZhou
 * @Desc file工具
 */
import fs from 'fs';
import type Koa from 'koa' 

export namespace uFile {
    export const checkGzip = (path: string, ctx: Koa.Context) => {
        if (!ctx.acceptsEncodings('gzip')) {
            return false;
        }
        return fs.existsSync(`${path}.gz`);
    };

    export const clearDir = (path: string, deleteDir = false) => {
        let files: string[] = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(file => {
                const curPath = `${path}/${file}`;
                if (fs.statSync(curPath).isDirectory()) {
                    clearDir(curPath); // 递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); // 删除文件
                }
            });
            deleteDir && fs.rmdirSync(path);
        }
    };
}

export default uFile;
