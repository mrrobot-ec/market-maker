import {ContainerModule, interfaces} from 'inversify';
import WebSocket from 'ws';
import {WebSocketSymbol} from "../symbols";


export const webSocketBinding = new ContainerModule((bind: interfaces.Bind): void => {
    bind<() => WebSocket>(WebSocketSymbol)
        .toDynamicValue(() => () => new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@depth'))
        .inSingletonScope();
});