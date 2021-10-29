import { Authorization, Challenge, ResolverPlugin } from "@gitii/acme-client";
import Hetzner, { Record } from "hetzner-dns";
import { parseDomain, ParseResultType } from "parse-domain";
import debug from "debug";

const log = debug("acme-dns-01-hetzner");

export class HetznerResolverClient implements ResolverPlugin {
    readonly #client: Hetzner;

    constructor(hetznerApi: Hetzner) {
        this.#client = hetznerApi;

        this.createChallenge = this.createChallenge.bind(this);
        this.removeChallenge = this.removeChallenge.bind(this);
    }

    public readonly challengePriority: string[] = ["dns-01"];

    public async createChallenge(authz: Authorization, challenge: Challenge, keyAuthorization: string): Promise<void> {
        if (challenge.type != "dns-01") {
            throw new Error(`Unsupported challenge type ${challenge.type}`);
        }

        const dnsRecord = `_acme-challenge.${authz.identifier.value}`;

        const zoneId = await this.getZoneIdFromDomain(dnsRecord);

        const { prefix: dnsPrefix } = this.splitDomain(dnsRecord);

        log(`create record ${dnsPrefix} in zone ${zoneId}`);
        await this.#client.Records.Create(zoneId, dnsPrefix, "TXT", keyAuthorization, 60);
    }

    public async removeChallenge(authz: Authorization, challenge: Challenge, keyAuthorization: string): Promise<void> {
        if (challenge.type != "dns-01") {
            throw new Error(`Unsupported challenge type ${challenge.type}`);
        }

        const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
        const records = await this.getRecordsFromName(dnsRecord);

        for (const record of records) {
            if (record.value === keyAuthorization) {
                log(`delete record ${dnsRecord} with id ${record.id}`);
                await this.#client.Records.Delete(record.id);
            }
        }
    }

    public getClient(): Hetzner {
        return this.#client;
    }

    private async getZoneIdFromDomain(domain: string): Promise<string> {
        const allZones = await this.#client.Zones.GetAll();
        const { host } = this.splitDomain(domain);

        const zone = allZones.zones.find((z) => z.name == host);

        if (!zone) {
            throw new Error(`Failed to find zone with name ${domain}`);
        }

        return zone.id;
    }

    private async getRecordsFromName(recordName: string): Promise<Record[]> {
        const { prefix, host } = this.splitDomain(recordName);
        const zoneId = await this.getZoneIdFromDomain(host);
        const AllRecords = await this.#client.Records.GetAll(undefined, undefined, zoneId);

        const records = AllRecords.records.filter((r) => r.name == prefix);

        return records;
    }

    private splitDomain(fullDomain: string): { prefix: string; host: string } {
        let cleanDomain = fullDomain;
        let prefix = "";
        if (cleanDomain.startsWith("_")) {
            cleanDomain = cleanDomain.substr(1);
            prefix = "_";
        }

        const parsedDns = parseDomain(cleanDomain);
        if (parsedDns.type !== ParseResultType.Listed) {
            throw new Error(`Failed to parse dns ${cleanDomain}: ${JSON.stringify(parsedDns)}`);
        }

        return {
            prefix: prefix + parsedDns.subDomains.join("."),
            host: [parsedDns.domain, parsedDns.topLevelDomains.join(".")].join("."),
        };
    }
}

export interface HetznerApiArgs {
    token: string;
}
