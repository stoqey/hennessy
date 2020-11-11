/**
 *
 *
 * - Use IBKR
 * - Use Finnhub
 *
 * one constructor
 * - use envs
 * - use option constructor options
 */
import { FinnhubWS, FinnhubWSEvents } from "@stoqey/finnhub";
import ibkr, { IBKREVENTS, IbkrEvents } from "@stoqey/ibkr";
import { EventEmitter } from "events";
import { get as _get } from "lodash";
import { log } from "./logs";
import { MarketDataProviders } from "./providers";

export enum HEN {
  start = "START",
  data = "DATA",
  error = "error",
}

/**
 * Hennessy provider
 */
interface IHennessy {
  providerType: MarketDataProviders; // or process.env.HEN_PROVIDER
  env?: {
    finnhubKey?: string; // or process.env.FINNHUB_KEY
    ibPort?: number; // or process.env.IB_PORT
    ibHost?: string; // or process.env.IB_PORT
  };
}

/**
 * Hennessy APP
 */
export class Hennessy extends EventEmitter {
  providerType: MarketDataProviders = MarketDataProviders.IBKR;

  provider: IbkrEvents | FinnhubWS | null = null;

  started: boolean = false;

  args?: IHennessy;

  constructor(args?: IHennessy) {
    super();
    this.args = args;
  }

  private startConfig = async (): Promise<void> => {
    const providerTypeFromEnv = _get(
      process.env,
      "HEN_PROVIDER",
      MarketDataProviders.FINNHUB,
    ) as MarketDataProviders;
    const { providerType = providerTypeFromEnv } = this.args || {};

    this.providerType = providerType; // set providerType

    log("startConfig", { providerType });
    if (providerType === MarketDataProviders.FINNHUB) {
      const finnhubToken = _get(process.env, "FINNHUB_KEY", undefined);

      this.provider = new FinnhubWS(finnhubToken);

      const finnhubProvider = this.provider;

      //   onReady
      finnhubProvider.on(FinnhubWSEvents.onReady, () => {
        console.log("Finnhub on ready");
        finnhubProvider.emit(HEN.start, true);
        this.started = true;
      });

      //   onData
      finnhubProvider.on(FinnhubWSEvents.onData, (data) => {
        console.log("Finnhub on data");
        finnhubProvider.emit(HEN.data, data);
      });

      //   on error
      finnhubProvider.on(FinnhubWSEvents.onError, (error) => {
        console.log("Finnhub on error");
        finnhubProvider.emit(HEN.error, error);
      });
    }

    if (providerType === MarketDataProviders.IBKR) {
      const ibEventsProvider = IbkrEvents.Instance; // start ibkrEvents

      const IB_HOST = _get(process.env, "IB_HOST", undefined);
      const IB_PORT = _get(process.env, "IB_PORT", undefined);

      let ib = null;

      //   If we have the envs
      if (IB_HOST && IB_PORT) {
        ib = await ibkr({
          port: +IB_PORT,
          host: IB_HOST,
        });
      } else {
        ib = await ibkr();
      }

      if (!ib) {
        throw new Error("error connecting to ibkr");
      }

      this.provider = ibEventsProvider;

      const ibkrProvider = this.provider;

      //   start
      this.startDrinking();

      //   error
      ibkrProvider.on(IBKREVENTS.ERROR, (data) => {
        ibkrProvider.emit(HEN.error, data);
      });

      //   on data / price updates
      ibkrProvider.on(IBKREVENTS.ON_PRICE_UPDATES, (error) => {
        this.startDrinking();
        ibkrProvider.emit(HEN.data, error);
      });
    }
  };

  /**
   * start
   */
  public start = async () => {
    return this.startConfig();
  };

  /**
   * startDrinking
   */
  private startDrinking = () => {
    log("start drinking now");
    if (!this.started && this.provider) {
      this.provider.emit(HEN.start, true);
      this.started = true;
    }
  };

  /**
   * addSymbol
   * IBKR { symbol, tickType }
   * FINNHUB symbol
   */
  addSymbol = (data: string | object) => {
    const providerType = this.providerType;
    const provider = this.provider;

    if (provider)
      switch (providerType) {
        case MarketDataProviders.FINNHUB:
          (provider as FinnhubWS).addSymbol(data as string);
          break;
        default:
        case MarketDataProviders.IBKR:
          provider.emit(IBKREVENTS.SUBSCRIBE_PRICE_UPDATES, data);
          break;
      }
  };

  /**
   * removeSymbol
   */
  removeSymbol = (symbol: string) => {
    const providerType = this.providerType;
    const provider = this.provider;

    if (provider)
      switch (providerType) {
        case MarketDataProviders.FINNHUB:
          (provider as FinnhubWS).removeSymbol(symbol);
          break;
        default:
        case MarketDataProviders.IBKR:
          provider.emit(IBKREVENTS.UNSUBSCRIBE_PRICE_UPDATES, symbol);
          break;
      }
  };

  /**
   * switchToProvider
   */
  // public switchToProvider() {}
}
