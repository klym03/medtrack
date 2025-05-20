"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const http = require("http");
const express = require("express");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(express.json())
            .forRoutes('/api/auth', '/api/analyses', '/api/blood-pressure');
        consumer
            .apply((0, http_proxy_middleware_1.createProxyMiddleware)({
            target: 'http://localhost:3000',
            changeOrigin: true,
            pathRewrite: (path, req) => {
                const newPath = '/auth' + path;
                console.log(`[API Gateway DEBUG] Auth PathRewrite: original req.url="${req.url}", original req.originalUrl="${req.originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
                return newPath;
            },
            on: {
                proxyReq: (proxyReq, req, res) => {
                    console.log(`[API Gateway] Proxying to auth-service: ${req.method} (originalUrl: ${req.originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
                    if (req.body) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
                proxyRes: (proxyRes, req, res) => {
                    console.log(`[API Gateway] Received response from auth-service: ${proxyRes.statusCode}`);
                },
                error: (err, req, res, target) => {
                    console.error(`[API Gateway] Proxy error to auth-service (${target?.toString()}):`, err);
                    if (res instanceof http.ServerResponse && !res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Auth Service Proxy Error', details: err.message }));
                    }
                    else if (res.socket && !res.socket.destroyed) {
                        console.error('[API Gateway] Closing socket due to proxy error to auth-service.');
                        res.socket.destroy();
                    }
                }
            }
        }))
            .forRoutes('/api/auth');
        consumer
            .apply((0, http_proxy_middleware_1.createProxyMiddleware)({
            target: 'http://localhost:3001',
            changeOrigin: true,
            pathRewrite: (path, req) => {
                const newPath = '/analyses' + path;
                console.log(`[API Gateway DEBUG] Analyses PathRewrite: original req.url="${req.url}", original req.originalUrl="${req.originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
                return newPath;
            },
            on: {
                proxyReq: (proxyReq, req, res) => {
                    console.log(`[API Gateway] Proxying to analysis-service (analyses): ${req.method} (originalUrl: ${req.originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
                    if (req.body) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
                proxyRes: (proxyRes, req, res) => {
                    console.log(`[API Gateway] Received response from analysis-service: ${proxyRes.statusCode}`);
                },
                error: (err, req, res, target) => {
                    console.error(`[API Gateway] Proxy error to analysis-service (${target?.toString()}):`, err);
                    if (res instanceof http.ServerResponse && !res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Analysis Service Proxy Error', details: err.message }));
                    }
                    else if (res.socket && !res.socket.destroyed) {
                        console.error('[API Gateway] Closing socket due to proxy error to analysis-service.');
                        res.socket.destroy();
                    }
                }
            }
        }))
            .forRoutes('/api/analyses');
        consumer
            .apply((0, http_proxy_middleware_1.createProxyMiddleware)({
            target: 'http://localhost:3001',
            changeOrigin: true,
            pathRewrite: (path, req) => {
                const newPath = '/blood-pressure' + path;
                console.log(`[API Gateway DEBUG] BP PathRewrite: original req.url="${req.url}", original req.originalUrl="${req.originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
                return newPath;
            },
            on: {
                proxyReq: (proxyReq, req, res) => {
                    console.log(`[API Gateway] Proxying to analysis-service (BP): ${req.method} (originalUrl: ${req.originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
                    if (req.body) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
                proxyRes: (proxyRes, req, res) => {
                    console.log(`[API Gateway] Received response from analysis-service for BP: ${proxyRes.statusCode}`);
                },
                error: (err, req, res, target) => {
                    console.error(`[API Gateway] Proxy error to analysis-service for BP (${target?.toString()}):`, err);
                    if (res instanceof http.ServerResponse && !res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Analysis Service (BP) Proxy Error', details: err.message }));
                    }
                    else if (res.socket && !res.socket.destroyed) {
                        console.error('[API Gateway] Closing socket due to proxy error to analysis-service for BP.');
                        res.socket.destroy();
                    }
                }
            }
        }))
            .forRoutes('/api/blood-pressure');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true })],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map