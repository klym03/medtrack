import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as http from 'http';
import * as express from 'express';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json())
      .forRoutes('/api/auth', '/api/analyses', '/api/blood-pressure');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: (path, req) => {
            const newPath = '/auth' + path;
            console.log(`[API Gateway DEBUG] Auth PathRewrite: original req.url="${(req as any).url}", original req.originalUrl="${(req as any).originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
            return newPath;
          },
          on: {
            proxyReq: (proxyReq, req: http.IncomingMessage, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to auth-service: ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if ((req as any).body) {
                const bodyData = JSON.stringify((req as any).body);
                proxyReq.setHeader('Content-Type','application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            },
            proxyRes: (proxyRes, req, res) => {
              console.log(`[API Gateway] Received response from auth-service: ${proxyRes.statusCode}`);
            },
            error: (err, req: http.IncomingMessage, res: http.ServerResponse | any, target) => { 
              console.error(`[API Gateway] Proxy error to auth-service (${target?.toString()}):`, err);
              if (res instanceof http.ServerResponse && !res.headersSent) {
                 res.writeHead(500, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ message: 'Auth Service Proxy Error', details: err.message }));
              } else if (res.socket && !res.socket.destroyed) {
                console.error('[API Gateway] Closing socket due to proxy error to auth-service.');
                res.socket.destroy();
              }
            }
          }
        }),
      )
      .forRoutes('/api/auth');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
          pathRewrite: (path, req) => {
            const newPath = '/analyses' + path;
            console.log(`[API Gateway DEBUG] Analyses PathRewrite: original req.url="${(req as any).url}", original req.originalUrl="${(req as any).originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
            return newPath;
          },
          on: {
            proxyReq: (proxyReq, req: http.IncomingMessage, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to analysis-service (analyses): ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if ((req as any).body) {
                const bodyData = JSON.stringify((req as any).body);
                proxyReq.setHeader('Content-Type','application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            },
            proxyRes: (proxyRes, req, res) => {
              console.log(`[API Gateway] Received response from analysis-service: ${proxyRes.statusCode}`);
            },
            error: (err, req: http.IncomingMessage, res: http.ServerResponse | any, target) => { 
              console.error(`[API Gateway] Proxy error to analysis-service (${target?.toString()}):`, err);
              if (res instanceof http.ServerResponse && !res.headersSent) {
                 res.writeHead(500, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ message: 'Analysis Service Proxy Error', details: err.message }));
              } else if (res.socket && !res.socket.destroyed) {
                console.error('[API Gateway] Closing socket due to proxy error to analysis-service.');
                res.socket.destroy();
              }
            }
          }
        }),
      )
      .forRoutes('/api/analyses');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
          pathRewrite: (path, req) => {
            const newPath = '/blood-pressure' + path;
            console.log(`[API Gateway DEBUG] BP PathRewrite: original req.url="${(req as any).url}", original req.originalUrl="${(req as any).originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
            return newPath;
          },
          on: {
            proxyReq: (proxyReq, req: http.IncomingMessage, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to analysis-service (BP): ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if ((req as any).body) {
                const bodyData = JSON.stringify((req as any).body);
                proxyReq.setHeader('Content-Type','application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            },
            proxyRes: (proxyRes, req, res) => {
              console.log(`[API Gateway] Received response from analysis-service for BP: ${proxyRes.statusCode}`);
            },
            error: (err, req: http.IncomingMessage, res: http.ServerResponse | any, target) => { 
              console.error(`[API Gateway] Proxy error to analysis-service for BP (${target?.toString()}):`, err);
              if (res instanceof http.ServerResponse && !res.headersSent) {
                 res.writeHead(500, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ message: 'Analysis Service (BP) Proxy Error', details: err.message }));
              } else if (res.socket && !res.socket.destroyed) {
                console.error('[API Gateway] Closing socket due to proxy error to analysis-service for BP.');
                res.socket.destroy();
              }
            }
          }
        }),
      )
      .forRoutes('/api/blood-pressure');
  }
}
