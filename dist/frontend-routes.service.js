var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Injectable, NitroStackServer, } from '@nitrostack/core';
let FrontendRoutesService = class FrontendRoutesService {
    server;
    frontendOut = path.resolve(process.cwd(), 'frontend', 'out');
    constructor(server) {
        this.server = server;
    }
    onApplicationBootstrap() {
        if (!fs.existsSync(this.frontendOut)) {
            return;
        }
        const transport = this.server.getHttpTransport();
        const app = transport?.getApp?.();
        if (!app) {
            return;
        }
        app.use(express.static(this.frontendOut, { index: false }));
        app.get(/^\/(?!mcp(?:\/|$)|sse(?:\/|$)).*/, (req, res, next) => {
            if (path.extname(req.path)) {
                next();
                return;
            }
            const pageFile = this.resolvePageFile(req.path);
            res.sendFile(pageFile);
        });
    }
    resolvePageFile(requestPath) {
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
};
FrontendRoutesService = __decorate([
    Injectable({ deps: [NitroStackServer] }),
    __metadata("design:paramtypes", [NitroStackServer])
], FrontendRoutesService);
export { FrontendRoutesService };
//# sourceMappingURL=frontend-routes.service.js.map