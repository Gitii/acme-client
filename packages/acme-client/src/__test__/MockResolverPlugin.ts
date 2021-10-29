import { Authorization, ResolverPlugin } from "../resolverPlugin";
import { Challenge } from "../rfc8555";

export default class MockResolverPlugin implements ResolverPlugin {
    challengePriority: string[] = [];
    createChallenge: (authz: Authorization, challenge: Challenge, keyAuthorization: string) => Promise<void>;
    removeChallenge: (authz: Authorization, challenge: Challenge, keyAuthorization: string) => Promise<void>;

    mocks: {
        createChallenge: jest.MockedFunction<ResolverPlugin["createChallenge"]>;
        removeChallenge: jest.MockedFunction<ResolverPlugin["removeChallenge"]>;
    };

    constructor() {
        this.mocks = {
            createChallenge: jest.fn(),
            removeChallenge: jest.fn(),
        };

        this.createChallenge = this.mocks.createChallenge;
        this.removeChallenge = this.mocks.removeChallenge;
    }
}