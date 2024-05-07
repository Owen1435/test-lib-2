/* eslint-disable @typescript-eslint/camelcase */

import { pipeline, Transform } from 'stream';
import { hostname } from 'node:os';
import build from 'pino-abstract-transport';
import { CdpTransportOptions, LogEntry, LogLevel, PinoLogDescriptor, PinoLogLevel } from './interfaces';

const levelMap: Record<PinoLogLevel, LogLevel> = {
    10: LogLevel.Trace,
    20: LogLevel.Debug,
    30: LogLevel.Info,
    40: LogLevel.Warn,
    50: LogLevel.Error,
    60: LogLevel.Fatal,
};

async function factory(options: CdpTransportOptions) {
    return build(
        function (source) {
            const myTransportStream = new Transform({
                autoDestroy: true,

                objectMode: true,
                transform(chunk: PinoLogDescriptor, enc, cb) {
                    // stringify the payload again
                    const entry: LogEntry = {
                        bu_code: options.buCode,
                        env: options.env,
                        hostname: hostname(),
                        log_timestamp: new Date(chunk.time).toISOString(),
                        level: levelMap[chunk.level],
                        message: chunk.message.msg,
                        data: {
                            context: chunk.context,
                            trace_id: chunk.message.traceId,
                        },
                        app_name: options.applicationName,
                        app_version: options.applicationVersion,
                    };
                    this.push(JSON.stringify(entry) + '\n');
                    cb();
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            pipeline(source, myTransportStream, () => {});
            return myTransportStream;
        },
        {
            // This is needed to be able to pipeline transports.
            enablePipelining: true,
        },
    );
}

module.exports = factory;
