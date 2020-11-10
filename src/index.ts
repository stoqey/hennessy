/**
 * 
 
- Use IBKR
- Use Finnhub

one constructor
- use envs
- use option constructor options
 */

import { isEmpty, get as _get } from "lodash";
import ibkr, { IBKRConnection, IbkrEvents } from "@stoqey/ibkr";
import { FinnhubWS } from "@stoqey/finnhub";
import { MarketDataProviders } from "./providers";

/**
 * Hennessy provider
 */
interface IHennessy {
  provider: MarketDataProviders; // or process.env.HEN_PROVIDER
  env?: {
    finnhubKey?: string; // or process.env.FINNHUB_KEY
    ibPort?: number; // or process.env.IB_PORT
    ibHost?: string; // or process.env.IB_PORT
  };
}

/**
 * Hennessy APP
 */
export class Hennessy {
  provider: IbkrEvents | FinnhubWS | null = null;

  constructor(args?: IHennessy) {
    const startConfig = async (): Promise<void> => {
      const { provider: providerType = MarketDataProviders.IBKR, env = null } =
        args || {};

      switch (providerType) {
        case MarketDataProviders.FINNHUB:
          const finnhubToken = _get(process.env, "FINNHUB_KEY", undefined);
          this.provider = new FinnhubWS(finnhubToken);

        //   All events here
          break;
        case MarketDataProviders.IBKR:
          const ibProvider = IbkrEvents.Instance; // start ibkrEvents

          const IB_HOST = _get(process.env, "IB_HOST", undefined);
          const IB_PORT = _get(process.env, "IB_PORT", undefined);

          if (IB_HOST && IB_PORT) {
            const ib = await ibkr({
              port: +IB_PORT,
              host: IB_HOST,
            });

            if (!ib) {
              throw new Error("error connecting to ibkr");
            }

            this.provider = ibProvider;

            // TODO all events here
          }
          throw new Error("incorrect IB_PORT or IB_PORT, please try again");

          break;
        default:
      }

      return;
    };

    startConfig();
  }

  /**
   * addSymbol
   */
  public addSymbol() {}

  /**
   * removeSymbol
   */
  public removeSymbol() {}

  /**
   * switchToProvider
   */
  public switchToProvider(provider: MarketDataProviders) {}
}

export default Hennessy;
