const express = require("express");
const cors = require("cors");
const yahooFinance = require("yahoo-finance2").default;

const app = express();
app.use(cors());

app.get("/stocks", async (req, res) => {
  try {
    const result = await yahooFinance.screener({
      scrIds: "undervalued_growth_stocks",
      count: 250,
    });

    const stocks = (result.quotes || []).map(s => ({
      ticker: s.symbol,
      name: s.longName || s.shortName || s.symbol,
      sector: s.sector || "Unknown",
      price: s.regularMarketPrice || 0,
      marketCap: s.marketCap ? +(s.marketCap / 1e9).toFixed(1) : 0,
      pe: s.forwardPE ? +s.forwardPE.toFixed(1) : null,
      ebitdaGrowth: s.earningsGrowth ? +(s.earningsGrowth * 100).toFixed(1) : null,
      revenueGrowth: s.revenueGrowth ? +(s.revenueGrowth * 100).toFixed(1) : null,
      margin: s.profitMargins ? +(s.profitMargins * 100).toFixed(1) : null,
      debtEquity: s.debtToEquity ? +(s.debtToEquity / 100).toFixed(2) : null,
      divYield: s.dividendYield ? +(s.dividendYield * 100).toFixed(2) : 0,
      beta: s.beta ? +s.beta.toFixed(2) : null,
      volatility: s["52WeekChange"] ? +(Math.abs(s["52WeekChange"]) * 100).toFixed(1) : null,
    })).filter(s => s.ticker && s.marketCap > 0);

    res.json(stocks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Running!"));
