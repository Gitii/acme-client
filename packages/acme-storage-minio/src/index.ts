import { Client, ClientOptions } from "minio";
import { MinioStoragePlugin } from "./MinioStoragePlugin";

export * from "./MinioStoragePlugin";

export function create({ bucketName, ...options }: ClientOptions & { bucketName: string }): MinioStoragePlugin {
    return new MinioStoragePlugin(bucketName, new Client(options));
}
