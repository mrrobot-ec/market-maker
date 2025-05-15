import { Container } from 'inversify';
import {loggerBinding} from "./di/bindings/loggerBindings";
import {midPriceBinding} from "./di/bindings/midPriceBindings";
import {webSocketBinding} from "./di/bindings/webSocketBindings";
import {exchangeServicesBinding} from "./di/bindings/exchangeServicesBindings";

const container = new Container();

container.load(
    webSocketBinding,
    loggerBinding,
    exchangeServicesBinding,
    midPriceBinding
);

export default container;