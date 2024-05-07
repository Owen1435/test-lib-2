import pinoPretty from 'pino-pretty';
import { bold, yellow } from 'colorette';
import { PinoLogDescriptor } from './interfaces';

function format(log: PinoLogDescriptor): string {
    const message = typeof log.message.msg === 'object' ? JSON.stringify(log.message.msg) : log.message.msg;
    return `${log.message.traceId ? yellow(log.message.traceId) : ''} ${bold(log.context)} ${message}`;
}

module.exports = opts =>
    pinoPretty({
        ...opts,
        messageFormat: format,
    });
