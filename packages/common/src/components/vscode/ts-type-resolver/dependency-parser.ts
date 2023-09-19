import * as path from 'path-browserify';
import { ImportResourcePath } from './types';

export class DependencyParser {
    private REGEX_NODE_MODULE = /^node:([\w\W\/]+)$/;

    // https://github.com/lukasbach/monaco-editor-auto-typings/commit/fc046e7d9a2abbb5121ad8ab25195d8c1c277416
    public parseDependencies(source: string, parent: ImportResourcePath | string): ImportResourcePath[] {
        const importRegex = /import *.+ *from *['"](?<importPath>.+?)['"]/g;
        const dynamicImportRegex = /await import ?\(['"](?<importPath>.+?)['"]\)/g;
        const cjsRequireRegex = /require *\(['"](?<importPath>.+?)['"]\)/g;

        const matches = [
            ...source.matchAll(importRegex),
            ...source.matchAll(dynamicImportRegex),
            ...source.matchAll(cjsRequireRegex)
        ];
        const importPaths = matches.map(match => match.groups?.['importPath']);
        const result = importPaths.map(imp => this.resolvePath(imp, parent));

        return result
    }

    private resolvePath(importPath: string, parent: ImportResourcePath | string): ImportResourcePath {
        const nodeImport = importPath.match(this.REGEX_NODE_MODULE);
        if (nodeImport) {
            return {
                kind: 'relative-in-package',
                packageName: '@types/node',
                importPath: `${nodeImport[1]}.d.ts`,
                sourcePath: '',
            };
        }

        if (typeof parent === 'string') {
            if (importPath.startsWith('.')) {
                return {
                    kind: 'relative',
                    importPath,
                    sourcePath: parent,
                };
            }
            else if (importPath.startsWith('@')) {
                const segments = importPath.split('/');
                return {
                    kind: 'package',
                    packageName: `${segments[0]}/${segments[1]}`,
                    importPath: segments.slice(2).join('/'),
                };
            }
            else {
                const segments = importPath.split('/');
                return {
                    kind: 'package',
                    packageName: segments[0],
                    importPath: segments.slice(1).join('/'),
                };
            }
        }
        else {
            switch (parent.kind) {
                case 'package':
                    throw Error('TODO?');
                case 'relative':
                    throw Error('TODO2?');
                case 'relative-in-package':
                    if (importPath.startsWith('.')) {
                        return {
                            kind: 'relative-in-package',
                            packageName: parent.packageName,
                            sourcePath: path.join(parent.sourcePath, parent.importPath),
                            importPath: importPath,
                        };
                    }
                    else if (importPath.startsWith('@')) {
                        const segments = importPath.split('/');
                        return {
                            kind: 'package',
                            packageName: `${segments[0]}/${segments[1]}`,
                            importPath: segments.slice(2).join('/'),
                        };
                    }
                    else {
                        const segments = importPath.split('/');
                        return {
                            kind: 'package',
                            packageName: segments[0],
                            importPath: segments.slice(1).join('/'),
                        };
                    }
            }
        }
        return null;
    }
}
