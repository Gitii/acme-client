jest.mock("minio");
jest.mock("../HetznerResolverClient");

import { Mock } from "ts-mockery";
import { create, HetznerApiArgs, HetznerResolverClient } from "../index";

describe("index", function () {
    describe("create", function () {
        it("creates client", () => {
            const client = create(Mock.of<HetznerApiArgs>());

            expect(client).toBeInstanceOf(HetznerResolverClient);
        });
    });
});
