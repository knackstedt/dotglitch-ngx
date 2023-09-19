import { SourceCache } from './types';

export class DummySourceCache implements SourceCache {
    public getFile(uri: string): Promise<string | undefined> {
        return undefined;
    }

    public async isFileAvailable(uri: string): Promise<boolean> {
        return false;
    }

    public storeFile(uri: string, content: string): Promise<void> {
        return undefined;
    }

    public clear(): Promise<void> {
        return undefined;
    }
}
