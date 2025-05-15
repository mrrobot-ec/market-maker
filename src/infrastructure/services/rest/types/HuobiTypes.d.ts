export interface HuobiResponse {
    ch: string;
    status: string;
    ts: number;
    tick: {
        ts: number;
        version: number;
        bids: number[][];
        asks: number[][];
    };
}