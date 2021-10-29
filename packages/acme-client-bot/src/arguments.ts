import { Command } from "commander";
import { existsSync, promises } from "fs";
import { isArray, isBoolean, isPlainObject as isPlainObjectBase, isString } from "lodash";

const { readFile } = promises;

export const ENV_CERT_PREFIX = "CERT_";

export interface Certificate {
    key: string;
    subject: string;
    altNames: string[];
}

export interface Arguments {
    storage: {
        accessKey: string;
        secretKey: string;
        endpoint: string;
        port: number;
        path: string;

        bucketName: string;
        bucketRegion: string;
    };
    challenge: {
        token: string;
    };
    certificates: Certificate[];
    maintainerEmail: string;

    useStagingDirectory: boolean;
}

export interface RawArguments {
    accessKeyFile: string;
    secretKeyFile: string;
    storageEndpoint: string;
    storagePath: string;
    certificate?: string[];
    certificateFromEnv?: boolean;

    maintainerEmail: string;
    challengeTokenFile: string;

    storageBucketName: string;
    storageRegionName: string;

    stagingDirectory: boolean;
}

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
    return isPlainObjectBase(obj);
}

function assertParsedArgs(parsedArgs: unknown): asserts parsedArgs is RawArguments {
    if (!isPlainObject(parsedArgs)) {
        throw new Error("parsedArgs is not an object");
    }

    if (
        !isString(parsedArgs["accessKeyFile"]) ||
        !isString(parsedArgs["secretKeyFile"]) ||
        !isString(parsedArgs["storageEndpoint"]) ||
        !isString(parsedArgs["storagePath"]) ||
        !isString(parsedArgs["maintainerEmail"]) ||
        !isString(parsedArgs["challengeTokenFile"]) ||
        !isString(parsedArgs["storageBucketName"]) ||
        !isString(parsedArgs["storageRegionName"]) ||
        !isArray(parsedArgs["certificate"]) ||
        !parsedArgs["certificate"].every(isString) ||
        !isBoolean(parsedArgs["certificateFromEnv"]) ||
        !isBoolean(parsedArgs["stagingDirectory"])
    ) {
        console.error(parsedArgs);
        throw new Error("parsedArgs is malformed");
    }
}

async function readFileContentAsString(filePath: string): Promise<string> {
    if (!existsSync(filePath)) {
        throw new Error(`file doesn't exist: ${filePath}`);
    }

    const buffer = await readFile(filePath, { encoding: "utf8" });

    return buffer.toString().trim();
}

export function getCertificatesFromEnv(): Certificate[] {
    const envs = Object.entries(process.env);

    return envs
        .filter(([key]) => key.startsWith(ENV_CERT_PREFIX))
        .map(([key, value]) => parseEnvCertConfig(key, value!));
}

export function parseEnvCertConfig(key: string, value: string): Certificate {
    const certKey = key.substr(ENV_CERT_PREFIX.length);
    const parts = value.split(",").map((s) => s.trim());

    if (parts.length == 0) {
        throw new Error(`Invalid cert value: ${key}=${value}`);
    }

    const [subject, ...altNames] = parts;

    return {
        key: certKey,
        subject,
        altNames,
    };
}

function parseCertificateConfig(value: string): Certificate {
    const parts = value.split(",").map((s) => s.trim());

    if (parts.length < 1) {
        throw new Error(`Invalid cert value: value`);
    }

    const [key, subject, ...altNames] = parts;

    return {
        key,
        subject,
        altNames,
    };
}

export async function parseArguments(args: string[]): Promise<Arguments> {
    const program = new Command();
    program
        .name("tls-bot")
        .description("cron job that creates and renews certificate using let's encrypt and minio as storage.")
        .requiredOption(
            "--maintainer-email <email>",
            "e-mail of maintainer: used by let's encrypt as the contact for critical bug and security notices",
        )
        .requiredOption("--storage-bucket-name <name>", "Name of the bucket")
        .requiredOption("--storage-region-name <name>", "Name of the region")
        .requiredOption(
            "--challenge-token-file <file path>",
            "Path to the file which contains the token for the challenge",
        )
        .requiredOption("--access-key-file <file path>", "Path to the file which contains the access key")
        .requiredOption("--secret-key-file <file path>", "Path to the file which contains the secret key")
        .requiredOption("--storage-endpoint <url>", "Url to the endpoint where the certificates will be stored")
        .requiredOption(
            "--storage-path <path>",
            "Path on the storage endpoint which will be the base directory for the stored certificates",
        )
        .option(
            "-c, --certificate <certificates...>",
            "Certificate config. Must be a comma separated string: <key>,<subject>[,<altname0>,<altname1>, ..., <altnameN>]",
            [] as unknown as string,
        )
        .option(
            "--certificate-from-env",
            `Get certificate from environment variables: ${ENV_CERT_PREFIX}<key>=<subject>[,<altname0>,<altname1>, ..., <altnameN>]`,
            false,
        )
        .option("--staging-directory", `Use Let's Encrypt staging directory instead of the production one`, false);

    const parsedArgs = program.parse(args).opts();

    assertParsedArgs(parsedArgs);

    const endPointUrl = new URL(parsedArgs.storageEndpoint);
    const port = endPointUrl.port ?? (endPointUrl.protocol === "https" ? "443" : "80");

    return {
        storage: {
            accessKey: await readFileContentAsString(parsedArgs.accessKeyFile),
            secretKey: await readFileContentAsString(parsedArgs.secretKeyFile),
            path: parsedArgs.storagePath,
            endpoint: endPointUrl.hostname,
            port: Number(port),

            bucketName: parsedArgs.storageBucketName,
            bucketRegion: parsedArgs.storageRegionName,
        },
        challenge: {
            token: await readFileContentAsString(parsedArgs.challengeTokenFile),
        },
        certificates: parsedArgs.certificateFromEnv
            ? getCertificatesFromEnv()
            : parsedArgs.certificate!.map(parseCertificateConfig),

        maintainerEmail: parsedArgs.maintainerEmail,
        useStagingDirectory: parsedArgs.stagingDirectory,
    };
}
