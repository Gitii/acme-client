export interface StoragePlugin {
    getFile(path: string, defaultContent: string): Promise<string>;
    setFile(path: string, content: string): Promise<void>;

    join(...pathParts: string[]): string;
}
