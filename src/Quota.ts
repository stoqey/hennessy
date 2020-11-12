/**
 * Get quote prices
 */
import FinnhubAPI from "@stoqey/finnhub";
import { ContractObject, HistoricalData } from "@stoqey/ibkr";
import { isEmpty } from "lodash";
import { log } from "./logs";

type ContractSymbol = ContractObject | string;

/**
 * GetQuotePrice, use finnhub or IBKR
 * @param contract
 */
export const GetQuotePrice = async (
  contractSymbol: ContractSymbol,
): Promise<number | undefined> => {
  let closePrice: number | undefined;

  const symbol =
    typeof contractSymbol === "string"
      ? contractSymbol
      : contractSymbol && contractSymbol.symbol;
  const finnhubApi = new FinnhubAPI();
  // 1. use Finnhub
  const quote = await finnhubApi.getQuote(symbol);
  closePrice = quote.close;
  if (closePrice !== 0) {
    log(
      `Finnhub got closePrice symbol=${symbol} price=${closePrice} new entryPrice + marketPrice + averageCost`,
      closePrice,
    );
  } else {
    // 2. use interactive brokers from here
    log(
      `FINNHUB ${symbol} Failed to update portfolio market data empty entryPrice + marketPrice + averageCost`,
      symbol,
    );

    const HistoricalDataManager = HistoricalData.Instance;
    const marketData = await HistoricalDataManager.reqHistoricalData({
      symbol,
      whatToShow: "TRADES",
      durationStr: "1800 S",
      barSizeSetting: "1 secs",
    });

    if (!isEmpty(marketData)) {
      // use interactive brokers here
      const lastItem = marketData.pop();
      closePrice = lastItem && lastItem.close;

      log(
        `IBKR created closePrice ${symbol} price=${closePrice} new entryPrice + marketPrice + averageCost`,
        closePrice,
      );
    } else {
      log(
        `IBKR ${symbol} Failed to update portfolio market data empty entryPrice + marketPrice + averageCost`,
        symbol,
      );
    }
  }

  return closePrice;
};
