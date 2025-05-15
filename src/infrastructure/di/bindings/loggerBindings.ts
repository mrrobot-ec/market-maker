import {ContainerModule, interfaces} from 'inversify';
import winston from 'winston';
import {LoggerSymbol} from "../symbols";
import {logger} from "../../Logger";


export const loggerBinding = new ContainerModule((bind: interfaces.Bind): void => {
    bind<winston.Logger>(LoggerSymbol).toConstantValue(logger);
});