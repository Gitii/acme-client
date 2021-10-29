import { AcmeClient, createApiClient } from "@gitii/acme-client";
import { create as createResolverPlugin } from "@gitii/acme-dns-01-hetzner";
import { create as createStoragePlugin } from "@gitii/acme-storage-minio";
import { parseArguments } from "./arguments";

export async function main() {
    const args = await parseArguments(process.argv);

    const acmeApiClient = await createApiClient(args.useStagingDirectory);
    const acmeClient = new AcmeClient(
        args.maintainerEmail,
        createResolverPlugin({ token: args.challenge.token }),
        createStoragePlugin({
            bucketName: args.storage.bucketName,
            endPoint: args.storage.endpoint,
            accessKey: args.storage.accessKey,
            secretKey: args.storage.secretKey,
            region: args.storage.bucketRegion,
            port: args.storage.port,
            useSSL: args.storage.port === 443,
        }),
        acmeApiClient,
    );

    if (args.certificates.length == 0) {
        console.warn("No certificates found!");
    }

    for (const certificate of args.certificates) {
        acmeClient.addSite({
            subject: certificate.subject,
            altNames: certificate.altNames,
            key: certificate.key,
        });
    }

    const sites = await acmeClient.renew();

    for (const site of sites) {
        console.log("Renewed or retrieved certificate for", site.site.subject);
    }
}
