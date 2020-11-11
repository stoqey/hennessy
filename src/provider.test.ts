require("dotenv").config();
import { TickData } from "@stoqey/finnhub";
import "mocha";
import { Hennessy, HEN } from ".";

const henny = new Hennessy();

const symbol = "AAPL";

// before((done) => {
//   henny.on(HEN.start, async () => {
//     console.log("WS is ready");
//     done();
//   });
//   henny.start();
// });

describe("Finnhub Market data", () => {
  it("should get onData", (done) => {
    let completed = false;
    henny.on(HEN.data, (data: TickData) => {
      console.log("WS onData", data);
      if (!completed) {
        done();
      }
      completed = true;
    });

    henny.on(HEN.start, (started) => {
      console.log("Hennessy started", started);
      henny.addSymbol(symbol);
    });

    henny.start();
  });

  it("should stop getting data get onData", (done) => {
    henny.on(HEN.data, async (data: TickData) => {
      console.log("WS onData", data);
    });

    henny.on(HEN.start, async () => {
      // henny.addSymbol("EUR:USD");
      // henny.removeSymbol("BINANCE:LTCBTC");
      henny.removeSymbol(symbol);
    });

    henny.start();

    setTimeout(() => {
      done();
    }, 10000);
  });
});
