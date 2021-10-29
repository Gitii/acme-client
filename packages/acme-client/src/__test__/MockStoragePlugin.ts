import { StoragePlugin } from "../storagePlugin"

export default class MockStoragePlugin implements StoragePlugin {
    getFile: (path: string, defaultContent: string) => Promise<string>;
    setFile: (path: string, content: string) => Promise<void>;

    join: (...pathParts: string[]) => string;

    mocks: {
        getFile: jest.MockedFunction<StoragePlugin["getFile"]>,
        setFile: jest.MockedFunction<StoragePlugin["setFile"]>,
        join: jest.MockedFunction<StoragePlugin["join"]>,
    };

    constructor() {
        this.mocks = {
            getFile: jest.fn(),
            setFile: jest.fn(),
            join: jest.fn(),
        }

        this.getFile = this.mocks.getFile;
        this.setFile = this.mocks.setFile;
        this.join = this.mocks.join;
    }
}