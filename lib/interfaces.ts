import { ModuleMetadata, Type } from '@nestjs/common';
import { Params } from 'nestjs-pino';
import { TransportSingleOptions } from 'pino';

export type LoggerModuleOptions = Params;

export interface LoggerModuleOptionsFactory {
    createLoggerModuleOptions(options: LoggerModuleAsyncOptions): Promise<LoggerModuleOptions> | LoggerModuleOptions;
}

export interface LoggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    inject?: any[];
    useExisting?: Type<LoggerModuleOptionsFactory>;
    useClass?: Type<LoggerModuleOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
    options: {
        feature: string;
        stream: string;
        applicationName: string;
        applicationVersion: string;
    };
}

export interface LogContext {
    traceId?: string;
}

export interface LogDescriptor {
    message: {
        msg: string;
        traceId?: string;
    };
    optionalParams: Record<any, any>;
    context: string;
}

export type PinoLogLevel = 10 | 20 | 30 | 40 | 50 | 60;
export interface PinoLogDescriptor extends LogDescriptor {
    level: PinoLogLevel;
    time: number;
    pid: number;
    hostname: string;
    dd: {
        trace_id: string;
        span_id: string;
        service: string;
        version: string;
    };
}

export enum LogLevel {
    Trace = 'Trace',
    Debug = 'Debug',
    Info = 'Info',
    Warn = 'Warning',
    Error = 'Error',
    Fatal = 'Fatal',
}

export enum PrivacyLevel {
    PUBLIC = 0,
    PRIVATE = 1,
}

export interface LogEntry {
    bu_code: string;
    env: string;
    hostname: string;
    log_timestamp: string; // ISO string
    level: LogLevel;
    message: string;
    data: {
        context: string;
        trace_id: string; // internal trace_id
    };
    app_name: string;
    app_version: string;
}

export interface ILogger {
    verbose(msg: any, ...params: any[]): void;
    debug(msg: any, ...params: any[]): void;
    log(msg: any, ...params: any[]): void;
    warn(msg: any, ...params: any[]): void;
    error(msg: any, ...params: any[]): void;
    setContext(context: string): void;
    useContext<R>(context: LogContext, callback: (...args: any) => R);
    getTraceId(): string | undefined;
}

export interface CdpTransportOptions {
    buCode: string;
    env: string;
    projectTangram: string;
    projectTrangramId: string;
    dataPrivacy: PrivacyLevel;
    stream: string;
    feature: string;
    applicationName: string;
    applicationVersion: string;
}

export interface CdpTransport extends TransportSingleOptions {
    options: CdpTransportOptions;
}
