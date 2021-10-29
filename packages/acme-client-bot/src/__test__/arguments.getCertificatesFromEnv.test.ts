import { ENV_CERT_PREFIX, getCertificatesFromEnv } from "../arguments"

describe("getCertificatesFromEnv", function() {
    it("parse certs from env", () => {
        process.env = {
            [`${ENV_CERT_PREFIX}test`]: "test.com"
        };

        const certs = getCertificatesFromEnv();

        expect(certs).toEqual([
            {
                key: "test",
                subject: "test.com",
                altNames: []
            }
        ])
    })
})