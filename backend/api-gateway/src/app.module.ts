import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import * as http from 'http';
import * as express from 'express';
import { Request as ExpressRequest } from 'express';

@Module({
  imports: [ConfigModule.forRoot({ 
    isGlobal: true,
    envFilePath: '../../.env'
  })],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json())
      .forRoutes( 
        { path: '/api/auth/*', method: RequestMethod.POST },
        { path: '/api/auth/*', method: RequestMethod.PUT },
        { path: '/api/auth/*', method: RequestMethod.PATCH },
        { path: '/api/analyses', method: RequestMethod.POST },
        { path: '/api/analyses/*', method: RequestMethod.PUT },
        { path: '/api/analyses/*', method: RequestMethod.PATCH },
        { path: '/api/blood-pressure/*', method: RequestMethod.POST },
        { path: '/api/blood-pressure/*', method: RequestMethod.PUT },
        { path: '/api/blood-pressure/*', method: RequestMethod.PATCH },
        { path: '/api/medications/*', method: RequestMethod.POST },
        { path: '/api/medications/*', method: RequestMethod.PUT },
        { path: '/api/medications/*', method: RequestMethod.PATCH },
        { path: '/api/auth', method: RequestMethod.POST },
        { path: '/api/blood-pressure', method: RequestMethod.POST },
        { path: '/api/medications', method: RequestMethod.POST },
        { path: '/api/medication-reminders', method: RequestMethod.POST },
        { path: '/api/medication-reminders/*', method: RequestMethod.POST },
        { path: '/api/medication-reminders/*', method: RequestMethod.PUT },
        { path: '/api/medication-reminders/*', method: RequestMethod.PATCH },
        { path: '/api/chat', method: RequestMethod.POST },
        { path: '/api/chat/profile-context', method: RequestMethod.GET }
      );

    consumer
      .apply(
        createProxyMiddleware({
          target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
          changeOrigin: true,
          pathRewrite: (path, req: ExpressRequest) => {
            let subPath = path;
            if (req.originalUrl.startsWith('/api/auth/')) {
              subPath = req.originalUrl.substring('/api/auth'.length);
            } else if (req.originalUrl === '/api/auth') {
              subPath = '';
            }
            const newPath = '/auth' + subPath;
            console.log(`[API Gateway DEBUG] Auth PathRewrite: original req.url="${(req as any).url}", original req.originalUrl="${(req as any).originalUrl}", incoming path_arg="${path}", new target path="${newPath}"`);
            return newPath;
          },
          on: {
            proxyReq: (proxyReq, req: ExpressRequest, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to auth-service: ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type','application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
                console.log('[API Gateway] Auth: Forwarded body data.');
              }
            },
            proxyRes: (proxyRes, req: ExpressRequest, res) => {
              console.log(`[API Gateway] Received response from auth-service: ${proxyRes.statusCode}`);
            },
            error: (err, req: ExpressRequest, res: http.ServerResponse | any, target) => {
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
      .forRoutes('/api/auth', '/api/auth/*');

    const analysisServiceProxyOptions: Options = {
        target: process.env.ANALYSIS_SERVICE_URL || 'http://analysis-service:3001',
        changeOrigin: true,
        pathRewrite: (path, req: ExpressRequest) => {
            const originalUrl = req.originalUrl;
            let newPath = path;

            if (originalUrl.startsWith('/api/analyses')) {
                newPath = originalUrl.replace('/api/analyses', '/analyses');
            } else if (originalUrl.startsWith('/api/medications')) {
                newPath = originalUrl.replace('/api/medications', '/medications');
            } else if (originalUrl.startsWith('/api/blood-pressure')) {
                newPath = originalUrl.replace('/api/blood-pressure', '/blood-pressure');
            } else if (originalUrl.startsWith('/api/medication-reminders')) {
                newPath = originalUrl.replace('/api/medication-reminders', '/medication-reminders');
            } else if (originalUrl.startsWith('/api/chat/profile-context')) {
                newPath = originalUrl.replace('/api/chat/profile-context', '/chat/profile-context');
            }
            console.log(`[API Gateway DEBUG] Analysis PathRewrite: originalUrl="${originalUrl}", new target path="${newPath}"`);
            return newPath;
        },
        on: {
            proxyReq: (proxyReq, req: ExpressRequest, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to analysis-service: ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if (req.originalUrl === '/api/analyses/upload') {
                console.log('[API Gateway] Analysis Service Target: Passing through multipart/form-data for /api/analyses/upload.');
              } else if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
                console.log('[API Gateway] Analysis Service Target: Forwarded body data.');
              }
            },
            proxyRes: (proxyRes, req: ExpressRequest, res) => {
              console.log(`[API Gateway] Received response from analysis-service: ${proxyRes.statusCode} for ${req.originalUrl}`);
            },
            error: (err, req: ExpressRequest, res: http.ServerResponse | any, target) => {
              console.error(`[API Gateway] Proxy error to analysis-service (${target?.toString()}) for ${req.originalUrl}:`, err);
              if (res instanceof http.ServerResponse && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Analysis Service Proxy Error', details: err.message }));
              } else if (res.socket && !res.socket.destroyed) {
                console.error('[API Gateway] Closing socket due to proxy error to analysis-service.');
                res.socket.destroy();
              }
            }
        }
    };
    consumer
        .apply(createProxyMiddleware(analysisServiceProxyOptions))
        .forRoutes(
            '/api/analyses', '/api/analyses/*',
            '/api/medications', '/api/medications/*',
            '/api/blood-pressure', '/api/blood-pressure/*',
            '/api/medication-reminders', '/api/medication-reminders/*',
            '/api/chat/profile-context'
        );

    const chatServiceProxyOptions: Options = {
        target: process.env.CHAT_SERVICE_URL || 'http://chat-service:3002',
        changeOrigin: true,
        pathRewrite: (path, req: ExpressRequest) => {
            const originalUrl = req.originalUrl;
            let newPath = path;
            if (originalUrl.startsWith('/api/chat')) {
                if (!originalUrl.startsWith('/api/chat/profile-context')) {
                    newPath = originalUrl.replace('/api/chat', '/chat');
                }
            }
            console.log(`[API Gateway DEBUG] Chat PathRewrite: originalUrl="${originalUrl}", new target path="${newPath}"`);
            if (originalUrl.startsWith('/api/chat/profile-context')) return path;
            return newPath;
        },
        on: {
            proxyReq: (proxyReq, req: ExpressRequest, res: http.ServerResponse) => {
              console.log(`[API Gateway] Proxying to chat-service: ${req.method} (originalUrl: ${(req as any).originalUrl}, req.url: ${req.url}) -> ${proxyReq.path}`);
              if (req.body && req.method === 'POST') {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
                console.log('[API Gateway] Chat Service: Forwarded body data.');
              }
            },
            proxyRes: (proxyRes, req: ExpressRequest, res) => {
              console.log(`[API Gateway] Received response from chat-service: ${proxyRes.statusCode} for ${req.originalUrl}`);
            },
            error: (err, req: ExpressRequest, res: http.ServerResponse | any, target) => {
              console.error(`[API Gateway] Proxy error to chat-service (${target?.toString()}):`, err);
              if (res instanceof http.ServerResponse && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Chat Service Proxy Error', details: err.message }));
              } else if (res.socket && !res.socket.destroyed) {
                console.error('[API Gateway] Closing socket due to proxy error to chat-service.');
                res.socket.destroy();
              }
            }
        }
    };
    consumer
        .apply(createProxyMiddleware(chatServiceProxyOptions))
        .forRoutes('/api/chat', '/api/chat/*');
  }
}
