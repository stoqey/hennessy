/**
 * 
 
- Use IBKR
- Use Finnhub

one constructor
- use envs
- use option constructor options
 */

import { IBKRConnection } from '@stoqey/ibkr';
import { FinnhubWS } from '@stoqey/finnhub';
import { MarketDataProviders } from "./providers";


/**
 * Hennessy provider
 */
 interface IHennessy {
     provider?: MarketDataProviders;
     env?: {
        finnhubToken?: string;
        ibkrPort?: number;
        ibkrHost?: string;
     }  
}

/**
 * Hennessy APP
 */
export class Hennessy {

    provider: IBKRConnection | FinnhubWS | null =  null; 
    constructor(args?: IHennessy) {
        
    }

    /**
     * addSymbol
     */
    public addSymbol() {
        
    }

    /**
     * removeSymbol
     */
    public removeSymbol() {
        
    }

    /**
     * switchToProvider
     */
    public switchToProvider(provider: MarketDataProviders) {
        
    }
}

export default Hennessy;