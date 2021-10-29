import Hetzner from "hetzner-dns";
import { HetznerApiArgs, HetznerResolverClient } from "./HetznerResolverClient";

export * from "./HetznerResolverClient";

export function create({ token }: HetznerApiArgs): HetznerResolverClient {
    return new HetznerResolverClient(new Hetzner(token));
}
