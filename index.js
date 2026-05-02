const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/stocks", async (req, res) => {
  try {
    const key = process.env.FMP_API_KEY;
    const url = `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=100000000&isEtf=false&isActivelyTrading=true&limit=500&apikey=${key}`;
    
    const r = await fetch(url);
    const data = await r.json();

    const stocks = data.map(s => ({
      ticker: s.symbol,
      name: s.companyName,
      sector: s.sector || "Unknown",
      price: s.price || 0,
      marketCap: s.marketCap ? +(s.marketCap / 1e9).toFixed(1) : 0,
      pe: s.pe ? +s.pe.toFixed(1) : null,
      ebitdaGrowth: null,
      revenueGrowth: null,
      margin: null,
      debtEquity: null,
      divYield: s.lastAnnualDividend && s.price ? +((s.lastAnnualDividend / s.price) * 100).toFixed(2) : 0,
      beta: s.beta ? +s.beta.toFixed(2) : null,
      volatility: null,
    })).filter(s => s.ticker && s.marketCap > 0);

    res.json(stocks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Running!"));
