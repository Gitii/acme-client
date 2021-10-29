import acme from "acme-client";
import { getCertificateExpirationDate, renew } from "./certificateUtils";
import { ResolverPlugin } from "./resolverPlugin";
import { StoragePlugin } from "./storagePlugin";
import debug from "debug";

const log = debug("@gitii/acme-client");

export interface Site {
    key: string;

    subject: string;
    altNames: string[];
}

export interface Certificate {
    site: Site;

    certificatePath: string;
    fullChainCertificatePath: string;
    privateKeyPath: string;

    certificate: string;
    fullChainCertificate: string;
    privateKey: string;

    certificateExpirationDate: Date;
}

export const FULL_CHAIN_CERTIFICATE_FILE_NAME = "fullChainCert.pem";
export const CERTIFICATE_FILE_NAME = "cert.pem";
export const PRIVATE_KEY_FILE_NAME = "key.pem";

export async function createApiClient(staging: boolean): Promise<acme.Client> {
    return new acme.Client({
        directoryUrl: staging ? acme.directory.letsencrypt.staging : acme.directory.letsencrypt.production,
        accountKey: await acme.forge.createPrivateKey(),
        backoffMax: 120_000,
        backoffMin: 60_000
    });
}

export class AcmeClient {
    private readonly _sites: Site[] = [];
    private readonly _resolverPlugin: ResolverPlugin;
    private readonly _storagePlugin: StoragePlugin;
    private readonly _acmeApiClient: acme.Client;
    private readonly _email: string;

    public constructor(
        email: string,
        resolverPlugin: ResolverPlugin,
        storagePlugin: StoragePlugin,
        acmeApiClient: acme.Client,
    ) {
        this._resolverPlugin = resolverPlugin;
        this._storagePlugin = storagePlugin;
        this._acmeApiClient = acmeApiClient;
        this._email = email;
    }

    public get sites(): Site[] {
        return [...this._sites];
    }

    public addSite(site: Site): void {
        this._sites.push(Object.freeze(site));
    }

    public async getCertificates(): Promise<Certificate[]> {
        const certs: Certificate[] = [];

        for (const site of this._sites) {
            certs.push(await this.getCertificateFromSite(site));
        }

        return certs;
    }

    public async getCertificateFromSite(site: Site): Promise<Certificate> {
        const certPath = this._storagePlugin.join(site.key, CERTIFICATE_FILE_NAME);
        const fullChainPath = this._storagePlugin.join(site.key, FULL_CHAIN_CERTIFICATE_FILE_NAME);
        const privKeyPath = this._storagePlugin.join(site.key, PRIVATE_KEY_FILE_NAME);

        const cert = await this._storagePlugin.getFile(certPath, "");

        return {
            certificateExpirationDate: cert.length != 0 ? getCertificateExpirationDate(cert) : new Date(1900, 1),
            certificatePath: certPath,
            fullChainCertificatePath: fullChainPath,
            privateKeyPath: privKeyPath,

            certificate: cert,
            fullChainCertificate: await this._storagePlugin.getFile(fullChainPath, ""),
            privateKey: await this._storagePlugin.getFile(privKeyPath, ""),

            site: site,
        };
    }

    public async renew(): Promise<Certificate[]> {
        const certs = await this.getCertificates();
        log(`There are ${certs.length} sites available`);

        const refreshDate = new Date();
        refreshDate.setDate(refreshDate.getDate() + 30);

        const expiringCerts = certs.filter((c) => c.certificateExpirationDate < refreshDate);
        log(`${expiringCerts.length}/${certs.length} are due for renewal`);

        await this.forceRenew(expiringCerts);

        return await this.getCertificates();
    }

    public async forceRenew(certificates: Certificate[]): Promise<void> {
        for (const certificate of certificates) {
            log(`Renewing certificate for ${certificate.site.subject}`);
            const refreshedCertificate = await renew({
                client: this._acmeApiClient,
                email: this._email,
                resolver: this._resolverPlugin,
                subject: certificate.site.subject,
                altNames: certificate.site.altNames,
            });
            log(`certificate has been renewed successfully and will expire ${getCertificateExpirationDate(refreshedCertificate.certificate)}`);

            await this._storagePlugin.setFile(certificate.fullChainCertificatePath, refreshedCertificate.fullChainCertificate);
            await this._storagePlugin.setFile(certificate.certificatePath, refreshedCertificate.certificate);
            await this._storagePlugin.setFile(certificate.privateKeyPath, refreshedCertificate.privateKey);
        }
    }
}
