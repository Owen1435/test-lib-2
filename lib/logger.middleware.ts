import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectLogger } from './inject-logger.decorator';
import { LoggerService } from './logger.service';
import { healthCheckMethod, TRACE_ID_HEADER_NAME } from './constants';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@InjectLogger('HTTP') private readonly logger: LoggerService) {}

    use(req: Request, res: Response, next: NextFunction): any {
        console.log('LoggerMiddleware', this.logger.getTraceId());

        const url = req.baseUrl;
        const method = req.method;
        const traceId = this.logger.getTraceId();
        if (traceId) {
            res.setHeader(TRACE_ID_HEADER_NAME, traceId);
        }

        if (healthCheckMethod === url) {
            return next();
        }

        this.logger.log(`Begin request:  ${method} ${url}`, {
            url,
            method,
            body: req.body,
            query: req.query,
            headers: req.headers,
        });

        res.on('finish', () => {
            const contentLength = +res.get('content-length');
            this.logger.log(`Request completed: ${method} ${url} ${res.statusCode} ${contentLength}`, {
                url,
                method,
                contentLength,
            });
        });
        next();
    }
}
