import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectLogger } from './inject-logger.decorator';
import { LoggerService } from './logger.service';
import { healthCheckMethod } from './constants';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@InjectLogger('HTTP') private readonly logger: LoggerService) {}

    use(req: Request, res: Response, next: NextFunction): any {
        const url = req.baseUrl;
        const method = req.method;

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
