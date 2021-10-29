jest.mock("../certificateUtils");

import acme from "acme-client";
import { Mock } from "ts-mockery";
import { AcmeClient, Site } from "../acmeClient";
import { getCertificateExpirationDate } from "../certificateUtils";
import { ResolverPlugin } from "../resolverPlugin";
import { StoragePlugin } from "../storagePlugin";
import MockStoragePlugin from "./MockStoragePlugin";

const mockGetCertificateExpirationDate = getCertificateExpirationDate as jest.MockedFunction<
    typeof getCertificateExpirationDate
>;

function createClient(
    args: {
        email?: string;
        resolverPlugin?: ResolverPlugin;
        storagePlugin?: StoragePlugin;
        acmeApiClient?: acme.Client;
    } = {},
): AcmeClient {
    return new AcmeClient(
        args.email ?? "mail@localhost",
        args.resolverPlugin ?? Mock.of<ResolverPlugin>(),
        args.storagePlugin ?? Mock.of<StoragePlugin>(),
        args.acmeApiClient ?? Mock.of<acme.Client>(),
    );
}

describe("AcmeClient", function () {
    describe("addSite", function () {
        it("add site", () => {
            const client = createClient();

            const site: Site = {
                key: "key",
                altNames: ["altName"],
                subject: "subject",
            };

            client.addSite(site);

            expect(client.sites).toEqual([site]);
        });
    });

    describe("getCertificates", function () {
        it("no sites, get empty cert array", () => {
            const client = createClient();

            expect(client.sites).toEqual([]);
        });

        it("one site, get populated cert array", async () => {
            const storagePlugin = new MockStoragePlugin();
            storagePlugin.mocks.join.mockImplementation((...parts) => parts.join("/"));
            storagePlugin.mocks.getFile.mockResolvedValue("cert");

            const expireDate = new Date();
            mockGetCertificateExpirationDate.mockReturnValue(expireDate);

            const client = createClient({
                storagePlugin: storagePlugin,
            });

            const site: Site = {
                key: "key",
                altNames: ["altName"],
                subject: "subject",
            };

            client.addSite(site);

            expect(await client.getCertificates()).toEqual([
                {
                    certificate: "cert",
                    certificateExpirationDate: expireDate,
                    certificatePath: "key/cert.pem",
                    privateKey: "cert",
                    privateKeyPath: "key/key.pem",
                    site: {
                        altNames: ["altName"],
                        key: "key",
                        subject: "subject",
                    },
                },
            ]);
        });
    });
});
