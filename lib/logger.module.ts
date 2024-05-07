import { AsyncLocalStorage } from 'async_hooks';
import { DynamicModule, Global, MiddlewareConsumer, Module, Provider, Scope } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino';
import { LoggerModuleAsyncOptions, LoggerModuleOptionsFactory } from './interfaces';
import { LoggerService } from './logger.service';
import { ASYNC_STORAGE, LOGGER_MODULE_OPTIONS } from './constants';
import { createProvidersForDecorated } from './inject-logger.decorator';
import { LoggerDefaultOptionsFactory } from './logger.default-options.factory';
import { LoggerMiddleware } from './logger.middleware';

@Global()
@Module({})
export class LoggerModule {
    private static isMiddlewareApplied = false;

    configure(consumer: MiddlewareConsumer) {
        if (!LoggerModule.isMiddlewareApplied) {
            consumer.apply(LoggerMiddleware).forRoutes('*');
            LoggerModule.isMiddlewareApplied = true;
        }
    }

    static forRootAsync(options?: LoggerModuleAsyncOptions): DynamicModule {
        const optionsProvider = LoggerModule.createAsyncOptionsProvider(LOGGER_MODULE_OPTIONS, options);
        const pinoOptionsProvider = LoggerModule.createAsyncOptionsProvider(PARAMS_PROVIDER_TOKEN, options);

        const decorated = createProvidersForDecorated();

        const pinoLoggerProvider: Provider = {
            provide: PinoLogger,
            useFactory: null,
            scope: Scope.TRANSIENT,
        };

        if (options?.useFactory) {
            pinoLoggerProvider.useFactory = options.useFactory;
        } else {
            pinoLoggerProvider.useFactory = (optionsFactory: LoggerDefaultOptionsFactory) => {
                return new PinoLogger(optionsFactory.createLoggerModuleOptions(options));
            };
        }

        if (options?.inject) {
            pinoLoggerProvider.inject = options.inject;
        } else {
            pinoLoggerProvider.inject = [LoggerDefaultOptionsFactory];
        }

        return {
            module: LoggerModule,
            imports: options?.imports ?? [ConfigModule],
            providers: [
                LoggerDefaultOptionsFactory,
                ConfigService,
                optionsProvider,
                pinoOptionsProvider,
                ...decorated,
                LoggerService,
                {
                    provide: ASYNC_STORAGE,
                    useClass: AsyncLocalStorage,
                },
                pinoLoggerProvider,
            ],
            exports: [
                LoggerDefaultOptionsFactory,
                optionsProvider,
                pinoOptionsProvider,
                LoggerService,
                ...decorated,
                pinoLoggerProvider,
                ASYNC_STORAGE,
            ],
        };
    }

    private static createAsyncOptionsProvider(token: string | symbol, options: LoggerModuleAsyncOptions): Provider {
        if (options?.useFactory) {
            return {
                provide: token,
                useFactory: options?.useFactory,
                inject: options?.inject || [],
            };
        }

        return {
            provide: token,
            useFactory: async (optionsFactory: LoggerModuleOptionsFactory) => optionsFactory.createLoggerModuleOptions(options),
            inject: [LoggerDefaultOptionsFactory],
        };
    }
}
