import * as ts from "typescript";

export function createSystem(files: { [name: string]: string; }): ts.System {
    files = { ...files };
    return {
        args: [],
        createDirectory: () => {
            throw new Error("createDirectory not implemented");
        },
        directoryExists: directory =>
            Object.keys(files).some(path => path.startsWith(directory)),
        exit: () => {
            throw new Error("exit not implemented");
        },
        fileExists: fileName => files[fileName] != null,
        getCurrentDirectory: () => "/",
        getDirectories: () => [],
        getExecutingFilePath: () => {
            throw new Error("getExecutingFilePath not implemented");
        },
        readDirectory: directory => (directory === "/" ? Object.keys(files) : []),
        readFile: fileName => files[fileName],
        resolvePath: path => path,
        newLine: "\n",
        useCaseSensitiveFileNames: true,
        write: () => {
            throw new Error("write not implemented");
        },
        writeFile: (fileName, contents) => {
            files[fileName] = contents;
        }
    };
}
