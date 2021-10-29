// eslint-disable-next-line @typescript-eslint/no-var-requires
jest.mock("hetzner-dns", () => require("./MockHetznerDns").MockHetznerDns);

import { Authorization, DnsChallenge, HttpChallenge } from "@gitii/acme-client";
import { Mock } from "ts-mockery";
import Hetzner, { AllRecordsResponse, AllZones, Record, Zone } from "hetzner-dns";
import { HetznerResolverClient } from "../HetznerResolverClient";
import { MockHetznerDns } from "./MockHetznerDns";

const TOKEN = "foobar";

describe("HetznerResolverClient", function () {
    describe("createChallenge", function () {
        it("set dns auth", async () => {
            const zoneName = "foobar.com";
            const recordName = "bar";
            const fullDns = [recordName, zoneName].join(".");
            const dnsAuthorization = "auth";

            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const mockHetznerClient = client.getClient() as unknown as MockHetznerDns;

            mockHetznerClient.Zones.GetAll.mockReturnValue(
                Mock.of<AllZones>({
                    zones: [
                        Mock.of<Zone>({
                            id: "id",
                            name: zoneName,
                        }),
                    ],
                }),
            );
            mockHetznerClient.Records.GetAll.mockReturnValue(
                Mock.of<AllRecordsResponse>({
                    records: [
                        Mock.of<Record>({
                            id: "id",
                            name: recordName,
                            value: dnsAuthorization,
                        }),
                    ],
                }),
            );

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: fullDns,
                },
            });

            const challenge = Mock.of<DnsChallenge>({
                type: "dns-01",
            });

            await client.createChallenge(authz, challenge, dnsAuthorization);

            expect(mockHetznerClient.Records.Create).toHaveBeenCalledWith(
                "id",
                `_acme-challenge.${recordName}`,
                "TXT",
                dnsAuthorization,
                60,
            );
        });

        it("unsupported challenge type", async () => {
            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: "a.b",
                },
            });

            const challenge = Mock.of<HttpChallenge>({
                type: "http-01",
            });

            const call = () => client.createChallenge(authz, challenge, "auth");

            await expect(call).rejects.toThrow(new Error(`Unsupported challenge type ${challenge.type}`));
        });

        it("failed to find zone", async () => {
            const dnsName = "foobar.com";

            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const mockHetznerClient = client.getClient() as unknown as MockHetznerDns;

            mockHetznerClient.Zones.GetAll.mockReturnValue(
                Mock.of<AllZones>({
                    zones: [],
                }),
            );

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: dnsName,
                },
            });

            const challenge = Mock.of<DnsChallenge>({
                type: "dns-01",
            });

            const call = () => client.createChallenge(authz, challenge, "auth");

            await expect(call).rejects.toThrowError(
                new Error(`Failed to find zone with name _acme-challenge.${dnsName}`),
            );
        });

        it("failed to parse dns", async () => {
            const zoneName = "fööbar.com";
            const recordName = "bar";
            const fullDns = [recordName, zoneName].join(".");

            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: fullDns,
                },
            });

            const challenge = Mock.of<DnsChallenge>({
                type: "dns-01",
            });

            const call = () => client.createChallenge(authz, challenge, "auth");

            await expect(call).rejects.toThrowError(
                new Error(
                    `Failed to parse dns acme-challenge.${fullDns}: {"type":"INVALID","hostname":"acme-challenge.bar.fööbar.com","errors":[{"type":"LABEL_INVALID_CHARACTER","message":"Label \\"fööbar\\" contains invalid character \\"ö\\" at column 2.","column":2}]}`,
                ),
            );
        });
    });
    describe("removeChallenge", function () {
        it("remove dns auth", async () => {
            const zoneName = "foobar.com";
            const recordName = "bar";
            const fullDns = [recordName, zoneName].join(".");
            const dnsAuthorization = "auth";

            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const mockHetznerClient = client.getClient() as unknown as MockHetznerDns;

            mockHetznerClient.Zones.GetAll.mockReturnValue(
                Mock.of<AllZones>({
                    zones: [
                        Mock.of<Zone>({
                            id: "id",
                            name: zoneName,
                        }),
                    ],
                }),
            );
            mockHetznerClient.Records.GetAll.mockReturnValue(
                Mock.of<AllRecordsResponse>({
                    records: [
                        Mock.of<Record>({
                            id: "id",
                            name: `_acme-challenge.${recordName}`,
                            value: dnsAuthorization,
                        }),
                    ],
                }),
            );

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: fullDns,
                },
            });

            const challenge = Mock.of<DnsChallenge>({
                type: "dns-01",
            });

            await client.removeChallenge(authz, challenge, dnsAuthorization);

            expect(mockHetznerClient.Records.Delete).toHaveBeenCalledWith("id");
        });
        it("nothing removed", async () => {
            const zoneName = "foobar.com";
            const recordName = "bar";
            const fullDns = [recordName, zoneName].join(".");
            const dnsAuthorization = "auth";

            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const mockHetznerClient = client.getClient() as unknown as MockHetznerDns;

            mockHetznerClient.Zones.GetAll.mockReturnValue(
                Mock.of<AllZones>({
                    zones: [
                        Mock.of<Zone>({
                            id: "id",
                            name: zoneName,
                        }),
                    ],
                }),
            );
            mockHetznerClient.Records.GetAll.mockReturnValue(
                Mock.of<AllRecordsResponse>({
                    records: [
                        Mock.of<Record>({
                            id: "id",
                            name: `_acme-challenge.${recordName}`,
                            value: "other auth",
                        }),
                    ],
                }),
            );

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: fullDns,
                },
            });

            const challenge = Mock.of<DnsChallenge>({
                type: "dns-01",
            });

            await client.removeChallenge(authz, challenge, dnsAuthorization);

            expect(mockHetznerClient.Records.Delete).not.toHaveBeenCalled();
        });

        it("unsupported challenge type", async () => {
            const client = new HetznerResolverClient(new Hetzner(TOKEN));

            const authz = Mock.of<Authorization>({
                identifier: {
                    type: "",
                    value: "a.b",
                },
            });

            const challenge = Mock.of<HttpChallenge>({
                type: "http-01",
            });

            const call = () => client.removeChallenge(authz, challenge, "auth");

            await expect(call).rejects.toThrow(new Error(`Unsupported challenge type ${challenge.type}`));
        });
    });
});
