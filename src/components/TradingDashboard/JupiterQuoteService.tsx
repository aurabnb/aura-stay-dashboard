
import { useToast } from '@/hooks/use-toast';

interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: any[];
}

export class JupiterQuoteService {
  private static readonly BASE_URL = 'https://quote-api.jup.ag/v6';
  
  static async getQuote(params: JupiterQuoteParams): Promise<JupiterQuote | null> {
    try {
      const { inputMint, outputMint, amount, slippageBps = 50 } = params;
      
      const url = new URL(`${this.BASE_URL}/quote`);
      url.searchParams.append('inputMint', inputMint);
      url.searchParams.append('outputMint', outputMint);
      url.searchParams.append('amount', amount.toString());
      url.searchParams.append('slippageBps', slippageBps.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Jupiter quote:', error);
      return null;
    }
  }

  static async getSwapTransaction(quoteResponse: JupiterQuote, userPublicKey: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        }),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting swap transaction:', error);
      return null;
    }
  }

  static getJupiterSwapUrl(inputToken: string, outputToken: string): string {
    return `https://jup.ag/swap/${inputToken}-${outputToken}`;
  }
}
