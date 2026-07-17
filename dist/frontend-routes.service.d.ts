import { NitroStackServer, type OnApplicationBootstrap } from '@nitrostack/core';
export declare class FrontendRoutesService implements OnApplicationBootstrap {
    private readonly server;
    private readonly frontendOut;
    constructor(server: NitroStackServer);
    onApplicationBootstrap(): void;
    private resolvePageFile;
}
//# sourceMappingURL=frontend-routes.service.d.ts.map