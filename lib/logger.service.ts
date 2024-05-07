import { AsyncLocalStorage } from 'async_hooks';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Logger, PinoLogger } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';
import { ASYNC_STORAGE, LOGGER_MODULE_OPTIONS, TRACE_ID_HEADER_NAME } from './constants';
import { ILogger, LogContext, LogDescriptor, LoggerModuleOptions } from './interfaces';
import { trace } from '@opentelemetry/api';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class LoggerService extends Logger implements ILogger {
    private context: string;

    constructor(
        pinoLogger: PinoLogger,
        @Inject(LOGGER_MODULE_OPTIONS) private readonly options: LoggerModuleOptions,
        @Inject(ASYNC_STORAGE) private readonly asyncStorage: AsyncLocalStorage<LogContext>,
    ) {
        super(pinoLogger, options);
    }

    public init(app: NestApplication) {
        app.use((req, res, next) => {
            this.useContext(
                {
                    traceId: req.headers[TRACE_ID_HEADER_NAME],
                },
                next,
            );
        });
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

    public useContext<R>(context: LogContext, callback: (...args: any) => R) {
        const oldContext = this.asyncStorage.getStore();
        console.log('useContext', oldContext, context);
        console.log(trace.getActiveSpan()?.spanContext());
        const ctx: LogContext = oldContext ?? {
            ...context,
            traceId: context.traceId ?? uuid(),
        };
        return this.asyncStorage.run(ctx, callback);
    }

    public getTraceId(): string | undefined {
        return this.asyncStorage.getStore()?.traceId;
    }

    private prepareMessage(message: any, ...optionalParams: any[]): LogDescriptor {
        const logContext = this.asyncStorage.getStore();

        return {
            message: {
                msg: message,
                traceId: logContext?.traceId,
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