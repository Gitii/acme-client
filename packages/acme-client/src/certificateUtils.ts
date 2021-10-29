import acme from "acme-client";
import forge from "node-forge";
import { ResolverPlugin } from "./resolverPlugin";

export function getCertificateExpirationDate(certificatePem: string): Date {
    const cert = forge.pki.certificateFromPem(certificatePem);

    return cert.validity.notAfter;
}

export interface CertificateConfig {
    client: acme.Client;
    email: string;
    resolver: ResolverPlugin;
    subject: string;
    altNames: string[];
}

export interface Certificate {
    certificate: string;
    fullChainCertificate: string;
    privateKey: string;
}

export async function renew({ client, resolver, email, subject, altNames }: CertificateConfig): Promise<Certificate> {
    /* Create CSR */
    const [key, csr] = await acme.forge.createCsr({
        commonName: subject,
        altNames: altNames,
    });

    /* Certificate */
    const fullChainCert = await client.auto({
        csr,
        email: email,
        termsOfServiceAgreed: true,
        challengeCreateFn: resolver.createChallenge.bind(resolver),
        challengeRemoveFn: resolver.removeChallenge.bind(resolver),
        challengePriority: resolver.challengePriority,
    });

    const certs = acme.forge.splitPemChain(fullChainCert);

    return {
        privateKey: key.toString(),
        certificate: certs[0],
        fullChainCertificate: fullChainCert
    };
}
