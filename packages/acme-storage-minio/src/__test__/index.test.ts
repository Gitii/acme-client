jest.mock("minio");
jest.mock("../MinioStoragePlugin");

import { ClientOptions, Client } from "minio"
import { Mock } from "ts-mockery";
import { create, MinioStoragePlugin } from "../index";


describe("index", function() {
    describe("create", function() {
        it("creates client", () => {
            const client = create({
                bucketName: "test",
                ...Mock.of<ClientOptions>(),
            });

            expect(client).toBeInstanceOf(MinioStoragePlugin);
        })
    })
})