import { Inject, Injectable, Scope } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import { LOGGER_MODULE_OPTIONS } from './constants';
import { ILogger, LogDescriptor, LoggerModuleOptions } from './interfaces';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class LoggerService extends Logger implements ILogger {
    private context: string;

    constructor(pinoLogger: PinoLogger, @Inject(LOGGER_MODULE_OPTIONS) private readonly options: LoggerModuleOptions) {
        super(pinoLogger, options);
    }

    public verbose(msg: any, ...params: any[]) {
        super.verbose(this.prepareMessage(msg, params));
    }

    public debug(msg: any, ...params: any[]) {
        super.debug(this.prepareMessage(msg, params));
    }

    public log(msg: any, ...params: any[]) {
        super.log(this.prepareMessage(msg, params));
    }

    public warn(msg: any, ...params: any[]) {
        super.warn(this.prepareMessage(msg, params));
    }

    public error(msg: any, ...params: any[]) {
        super.error(this.prepareMessage(msg, params));
    }

    public setContext(context: string) {
        this.context = context;
        this.logger.setContext(context);
    }

    private prepareMessage(message: any, ...optionalParams: any[]): LogDescriptor {
        return {
            message: {
                msg: message,
            },
            optionalParams,
            context: this.getContextName(optionalParams),
        };
    }

    private getContextName(optionalParams: any[]) {
        if (optionalParams.length === 1 && typeof optionalParams?.[0]?.[0] === 'string') {
            // In NestJS >= 8 context is passed as first optional argument
            return optionalParams[0][0];
        } else {
            return this.context;
        }
    }
}
