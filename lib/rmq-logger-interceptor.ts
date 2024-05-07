import { Message, RMQIntercepterClass } from 'nestjs-rmq';

export class LogErrorInterceptor extends RMQIntercepterClass {
    public intercept(res: any, msg: Message, error?: Error): Promise<any> {
        if (error) {
            this.logger.error(`Request to topic "${msg.fields.routingKey}" failed.\n${error.stack}`);
            error.message = `Topic ${msg.fields.routingKey} error: ${error.message}`;
            throw error;
        }
        return res;
    }
}

