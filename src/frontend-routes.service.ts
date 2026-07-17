import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  Injectable,
  NitroStackServer,
  type OnApplicationBootstrap,
} from '@nitrostack/core';

@Injectable({ deps: [NitroStackServer] })
export class FrontendRoutesService implements OnApplicationBootstrap {
  private readonly frontendOut = path.resolve(process.cwd(), 'frontend', 'out');

  constructor(private readonly server: NitroStackServer) {}

  onApplicationBootstrap(): void {
    if (!fs.existsSync(this.frontendOut)) {
      return;
    }

    const transport = this.server.getHttpTransport();
    const app = transport?.getApp?.();

    if (!app) {
      return;
    }

    app.use(express.static(this.frontendOut, { index: false }));

    app.get(/^\/(?!mcp(?:\/|$)|sse(?:\/|$)).*/, (req: Request, res: Response, next: NextFunction) => {
      if (path.extname(req.path)) {
        next();
        return;
      }

      const pageFile = this.resolvePageFile(req.path);
      res.sendFile(pageFile);
    });
  }

  private resolvePageFile(requestPath: string): string {
    const normalizedPath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    const relativePath = normalizedPath === path.sep ? '' : normalizedPath.replace(/^[/\\]/, '');
    const routeIndexFile = path.join(this.frontendOut, relativePath, 'index.html');
    const routeHtmlFile = path.join(this.frontendOut, `${relativePath}.html`);

    if (fs.existsSync(routeIndexFile)) {
      return routeIndexFile;
    }

    if (relativePath && fs.existsSync(routeHtmlFile)) {
      return routeHtmlFile;
    }

    return path.join(this.frontendOut, 'index.html');
  }
}
