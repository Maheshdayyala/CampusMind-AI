/**
 * CampusMind AI Server
 *
 * Boots the NitroStack MCP server. Frontend HTTP routes are registered through
 * FrontendRoutesService using NitroStack's public HTTP transport API.
 */
import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';
async function bootstrap() {
    process.env.NODE_ENV ??= 'production';
    const server = await McpApplicationFactory.create(AppModule);
    await server.start();
}
bootstrap().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map