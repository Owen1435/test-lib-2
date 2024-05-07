import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { TransportSingleOptions, TransportPipelineOptions } from 'pino';
import { CdpTransport, LoggerModuleAsyncOptions, LoggerModuleOptions, LoggerModuleOptionsFactory } from './interfaces';

@Injectable()
export class LoggerDefaultOptionsFactory implements LoggerModuleOptionsFactory {
    constructor(private readonly configService: ConfigService<unknown, true>) {}

    createLoggerModuleOptions(moduleOptions: LoggerModuleAsyncOptions): LoggerModuleOptions {
        let transport: TransportSingleOptions | TransportPipelineOptions;
        const isPretty = this.configService.get<string | boolean>('LOGGING_PRETTY');
        if ((typeof isPretty === 'string' && isPretty === 'true') || (typeof isPretty === 'boolean' && isPretty)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const target = require.resolve('./pino-pretty.transport');
            transport = {
                target,
                options: {
                    timestampKey: 'time',
                    translateTime: true,
                    singleLine: true,
                },
            };
        } else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const target = require.resolve('./json-cdp.transport');
            transport = {
                pipeline: [
                    {
                        target,
                        options: {
                            buCode: this.configService.get('BU_CODE'),
                            env: this.configService.get('ENV'),
                            applicationName: moduleOptions.options.applicationName,
                            applicationVersion: moduleOptions.options.applicationVersion,
                        },
                    } as CdpTransport,
                    {
                        target: 'pino/file',
                    },
                ],
            } as TransportPipelineOptions;
        }

        return {
            pinoHttp: {
                transport,
                level: this.configService.get<string>('LOGGING_LEVEL') ?? 'debug',
            },
        };
    }
}
