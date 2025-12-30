class CoinMarketCapService {
  private apiKey: string;
  private apiUrl?: string;

  constructor(apiKey: string, apiUrl: string = 'hhttps://sandbox-api.coinmarketcap.com') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }
}


class CoinGeckoService {
  private apiKey: string;
  private apiUrl?: string;

  constructor(apiKey: string,apiUrl: string = 'https://api.coingecko.com/api/v3/') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async fetchMarketData(assetIdentifier: string): Promise<any> {
    // Implementar a lógica para buscar dados de mercado do CoinGecko
    return {};
  }
}
