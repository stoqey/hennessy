require("dotenv").config();
import "mocha";
import { expect } from "chai";
import { GetQuotePrice } from "./Quota";

const symbol = "AAPL";

describe("Quote data", () => {
  it("should get quote from finhhub", async () => {
    const quote = await GetQuotePrice(symbol);
    expect(quote).to.be.greaterThan(0);
  });
});
