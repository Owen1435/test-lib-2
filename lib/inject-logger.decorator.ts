import { Inject, Provider, Scope } from '@nestjs/common';
import { LoggerService } from './logger.service';

const decoratedTokenPrefix = 'PPMLogger:';

const decoratedLoggers = new Set<string>();

export function getLoggerToken(context: string): string {
    return `${decoratedTokenPrefix}${context}`;
}

export function InjectLogger(context = '') {
    decoratedLoggers.add(context);
    return Inject(getLoggerToken(context));
}

function createDecoratedLoggerProvider(context: string): Provider<LoggerService> {
    return {
        provide: getLoggerToken(context),
        useFactory: (logger: LoggerService) => {
            logger.setContext(context);
            return logger;
        },
        inject: [LoggerService],
        scope: Scope.TRANSIENT,
    };
}

export function createProvidersForDecorated(): Array<Provider<LoggerService>> {
    return [...decoratedLoggers.values()].map(createDecoratedLoggerProvider);
}
