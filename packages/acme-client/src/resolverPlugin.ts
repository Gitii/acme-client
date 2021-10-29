import { Challenge, AuthorizationBase } from "./rfc8555";

export interface Authorization extends AuthorizationBase {
    url: string;
}

export interface ResolverPlugin {
    challengePriority: string[];
    createChallenge(authz: Authorization, challenge: Challenge, keyAuthorization: string): Promise<void>;
    removeChallenge(authz: Authorization, challenge: Challenge, keyAuthorization: string): Promise<void>;
}
