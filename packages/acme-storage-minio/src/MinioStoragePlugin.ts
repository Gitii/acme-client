import { StoragePlugin } from "@gitii/acme-client";
import { Client } from "minio";
import * as Stream from "stream";
import debug from "debug";

const log = debug("@gitii/acme-storage-minio")

function readStreamAsString(stream: Stream): Promise<string> {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        /* istanbul ignore next */
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
}

export class MinioStoragePlugin implements StoragePlugin {
    private _minioClient: Client;
    private _bucketName: string;

    constructor(bucketName: string, minioClient: Client) {
        this._bucketName = bucketName;
        this._minioClient = minioClient;
    }

    public async fileExists(path: string): Promise<boolean> {
        try {
            await this._minioClient.statObject(this._bucketName, path);
            log(`EXIST ${path}?: YES`);
            return true;
        } catch (e) {
            log(`EXIST ${path}?: NO`);
            return false;
        }
    }

    public async getFile(path: string, defaultContent: string): Promise<string> {
        if (await this.fileExists(path)) {
            log(`GET object ${path}...`);
            const response = await this._minioClient.getObject(this._bucketName, path);
            return await readStreamAsString(response);
        } else {
            return defaultContent;
        }
    }

    public async setFile(path: string, content: string): Promise<void> {
        const contentBuffer = Buffer.from(content, 'utf8');
        log(`PUT object ${path}...`);
        await this._minioClient.putObject(this._bucketName, path, contentBuffer);
    }

    public join(...pathParts: string[]): string {
        return pathParts.map((p) => p.trim()).join("/");
    }
}
