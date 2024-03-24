import { Module, DynamicModule, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { loadModule } from '@util/module';
import path from 'path';
import { CookieMiddleware } from './cookie.middleware';
import { RequestMiddleware } from './request.middleware';

export class AppModule implements NestModule
{
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(CookieMiddleware).forRoutes("space");
        consumer.apply(RequestMiddleware).forRoutes("*");
    }


    static async registerDynamicModules()
    {
        const modules = await loadModule(path.resolve(__dirname, 'server'));
        return {
            module : AppModule,
            imports : modules
        }
    }
}