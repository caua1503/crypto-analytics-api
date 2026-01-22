import axios, { AxiosInstance } from "axios";
import {ApiSentimentDataSchema, ApiSentimentData} from "../types/interfaces/integrations.interface.js";
import { SourceEnum } from "../types/common.js";

export class FearAndGreedIndex {
    private httpsInterface: AxiosInstance;

    constructor() {
        this.httpsInterface = axios.create();
    }

    async getIndexValue(): Promise<number> {
        try {
            const response = await this.httpsInterface.get("https://api.alternative.me/fng/");
            const value: string = response.data.data[0].value;
            return parseInt(value, 10);
        } catch (error) {
        throw new Error("Erro ao buscar Fear & Greed Index");
        }    
    }

    async getSentimentData(): Promise<ApiSentimentData> {
        const index = await this.getIndexValue();
        const sentiment = Math.round((index / 100) * 10);
        const data = ApiSentimentDataSchema.parse({
            fearGreedIndex: index,
            sentimentScore: sentiment,
            source: SourceEnum.ALTERNATIVE_ME,
            timestamp: new Date(),
        }); 

        return data ;

    }
}

// async function main() {
//     const index = await new FearAndGreedIndex().getSentimentData();
//     console.log(index);
// }

// main();
