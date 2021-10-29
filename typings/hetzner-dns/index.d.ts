export interface Zone {
    id: string;
    created: string;
    modified: string;
    legacy_dns_host: string;
    legacy_ns: [string];
    name: string;
    ns: [string];
    owner: string;
    paused: boolean;
    permission: string;
    project: string;
    registrar: string;
    status: "verified" | "failed" | "pending";
    ttl: number;
    verified: string;
    records_count: number;
    is_secondary_dns: boolean;
    txt_verification: {
        name: string;
        token: string;
    };
}

export interface AllZones {
    zones: Array<Zone>;
    meta: {
        pagination: {
            page: number;
            per_page: number;
            last_page: number;
            total_entries: number;
        };
    };
}

export interface Record {
    type: string;
    id: string;
    created: string;
    modified: string;
    zone_id: string;
    name: string;
    value: string;
    ttl: number;
}

export interface GetResponse {
    record: Record;
}

export interface AllRecordsResponse {
    records: Array<Record>;
}

declare class Client {
    constructor(apiKey: string);
    Zones: {
        GetAll: (page?: number, per_page?: number, search_name?: string, absolute_name?: string) => Promise<AllZones>;
        Create: (name: string, ttl?: number) => Promise<void>;
        Get: (ZoneID: string) => Promise<void>;
        Update: (ZoneID: string, name: string, ttl?: number) => Promise<void>;
        Delete: (ZoneID: string) => Promise<void>;
        File: {
            Import: (ZoneID: string, file: string) => Promise<void>;
            Export: (ZoneID: string) => Promise<void>;
            Validate: (file: string) => Promise<void>;
        };
    };
    Records: {
        GetAll: (page?: number, per_page?: number, ZoneID?: string) => Promise<AllRecordsResponse>;
        Create: (ZoneID: string, name: string, type: string, value: string, ttl: number) => Promise<void>;
        Get: (RecordID: string) => Promise<GetResponse>;
        Update: (
            RecordID: string,
            ZoneID: string,
            name: string,
            type: string,
            value: string,
            ttl: string,
        ) => Promise<void>;
        Delete: (RecordID: string) => Promise<void>;
    };
}

export default Client;
