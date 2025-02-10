import express from 'express';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import routes  from './presentation/v1/routes';
import container from './infrastructure/container';
import { swaggerSpec } from './presentation/swagger';
import { IMidPriceService } from './domain/interfaces/IMidPriceService';
import { LoggerSymbol, MidPriceServiceSymbol } from './domain/SymbolsForDI';


const app = express();
app.use(express.json());

app.use('/v1/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT ?? 3000;
const logger = container.get<winston.Logger>(LoggerSymbol);

async function startServer() {
    try {
        const midPriceService = await container.getAsync<IMidPriceService>(MidPriceServiceSymbol);

        app.locals.midPriceService = midPriceService;

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}. API Docs: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        logger.error('Failed to initialize dependencies:', error);
        process.exit(1);
    }
}

startServer();
