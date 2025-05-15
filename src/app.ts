import http from 'http';
import winston, {Logger} from 'winston';
import express, {Express} from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './presentation/v1/routes';
import container from './infrastructure/container';
import { swaggerSpec } from './presentation/swagger';
import { ExchangeServiceSymbol } from './infrastructure/di/symbols';
import { IMidPriceService } from './domain/interfaces/IMidPriceService';
import { IExchangeService } from './domain/interfaces/IExchangeService';
import { LoggerSymbol, MidPriceServiceSymbol } from './infrastructure/di/symbols';
import { BaseWebSocketService } from './infrastructure/services/websocket/BaseWebSocketService';

const app: Express = express();
app.use(express.json());

app.use('/v1/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT: string | 3000 = process.env.PORT ?? 3000;
const logger: Logger = container.get<winston.Logger>(LoggerSymbol);

let server: http.Server;

async function startServer(): Promise<void> {
    try {
        app.locals.midPriceService = await container.getAsync<IMidPriceService>(MidPriceServiceSymbol);

        server = app.listen(PORT, (): void => {
            logger.info(`🚀 Server running on port ${PORT}. API Docs: http://localhost:${PORT}/api-docs`);
        });

        // Set up graceful shutdown
        setupGracefulShutdown();
    } catch (error) {
        logger.error('Failed to initialize dependencies:', error);
        process.exit(1);
    }
}

function setupGracefulShutdown(): void {
    // Handle graceful shutdown
    const gracefulShutdown:() => Promise<void> = async (): Promise<void> => {
        logger.info('Shutting down gracefully...');

        try {
            // Clean up WebSocket connections
            const services:IExchangeService[] = await container.getAllAsync<IExchangeService>(ExchangeServiceSymbol);

            for (const service of services) {
                if (service instanceof BaseWebSocketService) {
                    service.dispose();
                }
            }

            // Close the HTTP server
            if (server) {
                server.close((): never => {
                    logger.info('HTTP server closed.');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }

            // Force exit after timeout
            setTimeout((): never => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    };

    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
}

startServer();