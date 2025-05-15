export interface KrakenTypes {
    error: string[];
    result: {
        [pair: string]: {
            asks: string[][];
            bids: string[][];
        };
    };
}
