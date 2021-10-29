jest.mock("minio");

import { BucketItemStat, Client, ClientOptions, UploadedObjectInfo } from "minio";
import { Readable } from "stream";
import { Mock } from "ts-mockery";
import { MinioStoragePlugin } from "../MinioStoragePlugin";

const mockClient = Client as jest.MockedClass<typeof Client>;

function createDefaultClient(options?: Partial<ClientOptions>): MinioStoragePlugin {
    const minioMock = new Client(Mock.of<ClientOptions>(options ?? {}));

    return new MinioStoragePlugin("test", minioMock);
}

describe("MinioStoragePlugin", function () {
    describe("join", function () {
        it("join empty", () => {
            const mcp = createDefaultClient();

            const path = mcp.join();

            expect(path).toBe("");
        });

        it("join parts", () => {
            const mcp = createDefaultClient();

            const path = mcp.join("a", "b");

            expect(path).toBe("a/b");
        });
    });

    describe("getFile", function () {
        it("file exists, get file content", async () => {
            const readable = new Readable();
            readable.push("hello");
            readable.push("world");
            readable.push(null);

            const file = mockClient.prototype.getObject.mockResolvedValue(readable);

            const mcp = createDefaultClient();
            const fileExistsMock = jest.fn(() => Promise.resolve(true));
            mcp.fileExists = fileExistsMock;

            const response = await mcp.getFile("a/b", "?");

            expect(response).toEqual("helloworld");

            expect(fileExistsMock.mock.calls).toEqual([["a/b"]]);

            expect(mockClient.prototype.getObject).toHaveBeenCalled();
        });

        it("file doesn't exist, get default file content", async () => {
            const file = mockClient.prototype.getObject.mockRejectedValue(null);

            const mcp = createDefaultClient();
            mcp.fileExists = jest.fn(() => Promise.resolve(false));

            const response = await mcp.getFile("a/b", "default content");

            expect(response).toEqual("default content");
        });
    });

    describe("setFile", function () {
        it("set file content", async () => {
            mockClient.prototype.putObject.mockResolvedValue(Mock.of<UploadedObjectInfo>());

            const mcp = createDefaultClient();

            await mcp.setFile("a/b", "foobar");

            expect(mockClient.prototype.putObject).toHaveBeenCalledWith("test", "a/b", expect.any(Buffer));
        });
    });

    describe("fileExists", function () {
        it("file does exist", async () => {
            mockClient.prototype.statObject.mockResolvedValue(Mock.of<BucketItemStat>());

            const mcp = createDefaultClient();

            const response = await mcp.fileExists("a/b");

            expect(mockClient.prototype.statObject).toHaveBeenCalledWith("test", "a/b");
            expect(response).toBe(true);
        });

        it("file doesn't exist", async () => {
            mockClient.prototype.statObject.mockRejectedValue(Mock.of<BucketItemStat>());

            const mcp = createDefaultClient();

            const response = await mcp.fileExists("a/b");

            expect(mockClient.prototype.statObject).toHaveBeenCalledWith("test", "a/b");
            expect(response).toBe(false);
        });
    });
});
