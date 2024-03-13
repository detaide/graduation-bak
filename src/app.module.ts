import { Module, DynamicModule } from '@nestjs/common';
import { loadModule } from '@util/module';
import path from 'path';

export class AppModule
{
    static async registerDynamicModules()
    {
        const modules = await loadModule(path.resolve(__dirname, 'server'));
        return {
            module : AppModule,
            imports : modules
        }
    }
}