/**
 * CampusMind AI Server
 *
 * Boots both:
 *   1. The MCP server (tools, resources, prompts)
 *   2. The built Next.js frontend (static export)
 *
 * On the same port:
 *   - GET /, /login, /dashboard, … → frontend pages
 *   - POST/GET/DELETE /mcp          → MCP protocol
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function bootstrap() {
    // Determine the frontend output directory
    const frontendOut = path.resolve(process.cwd(), 'frontend', 'out');
    const hasFrontend = fs.existsSync(frontendOut);
    if (hasFrontend) {
        // Monkey-patch StreamableHttpTransport so frontend static files are
        // served BEFORE the MCP routes are registered.  This ensures
        //   GET /, /login, /dashboard, …  resolve to frontend pages
        //   while POST/GET/DELETE /mcp     still reach the MCP server.
        const { StreamableHttpTransport } = await import('@nitrostack/core/dist/core/transports/streamable-http.js');
        const origSetupRoutes = StreamableHttpTransport.prototype.setupRoutes;
        StreamableHttpTransport.prototype.setupRoutes = function () {
            // 1. Static frontend files – handles /, /login, /dashboard, etc.
            this.app.use(express.static(frontendOut, { index: ['index.html'] }));
            // 2. Original MCP routes (/mcp, /sse, /mcp/health, etc.)
            origSetupRoutes.call(this);
            // 3. SPA catch-all – client-side routes like /chat/some-deep-link
            this.app.get('*', (_req, res) => {
                res.sendFile(path.join(frontendOut, 'index.html'));
            });
        };
    }
    // Create and start the MCP server (will use the patched setupRoutes)
    const server = await McpApplicationFactory.create(AppModule);
    await server.start();
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map