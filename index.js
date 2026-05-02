import express from "express";
import cors from "cors";
import yahooFinance from "yahoo-finance2";

const app = express();
app.use(cors());

const TICKERS = [
  "NVDA","MSFT","AAPL","AMZN","GOOGL","META","BRK-B","JPM","V","JNJ",
  "PG","UNH","XOM","CVX","TSLA","COST","HD","ABBV","AMD","CRM","LLY",
  "MA","NEE","PFE","T","UBER","SHOP","PLTR","ARM","SOFI","NIO","RIVN",
  "COIN","HOOD","RBLX","SNAP","PINS","LYFT","DKNG","PENN","MGM","LVS",
  "WYNN","CZR","MPWR","ENPH","FSLR","SEDG","RUN","BE","PLUG","BLDP",
  "QS","CHPT","LCID","FSR","GOEV","NKLA","HYLN","WKHS","RIDE","SOLO",
  "F","GM","STLA","TM","HMC","NSANY","VWAGY","BMWYY","MBGAF","RACE",
  "GS","MS","BAC","C","WFC","USB","PNC","TFC","COF","AXP","DFS","SYF",
  "PYPL","SQ","AFRM","UPST","LC","SOFI","NU","PAGS","STNE","MELI",
  "SE","GRAB","GOJEK","BIDU","JD","PDD","BABA","TCEHY","NTES","BEKE",
  "ZM","DOCU","TWLO","OKTA","DDOG","SNOW","MDB","ESTC","CFLT","NET",
  "TEAM","ATLASSIAN","ZS","PANW","CRWD","S","FTNT","CHKP","CYBR","VRNS",
  "INTC","QCOM","AVGO","TXN","MCHP","ADI","KLAC","LRCX","AMAT","ASML",
  "TSM","MU","WDC","STX","PSTG","NTAP","HPE","HPQ","DELL","SMCI",
  "IBM","ORCL","SAP","NOW","ADBE","INTU","ANSS","CDNS","SNPS","PTC",
  "AMGN","GILD","REGN","VRTX","BIIB","ILMN","IDXX","ISRG","SYK","BSX",
  "MDT","ABT","TMO","DHR","A","BIO","MTD","WAT","TECH","HOLX",
  "DIS","NFLX","WBD","PARA","FOX","NYT","SPOT","TTWO","EA","ATVI",
  "NKE","ADDYY","PUMA","UAA","LULU","VFC","PVH","RL","TPR","CPRI",
  "MCD","SBUX","YUM","QSR","DRI","CMG","SHAK","WING","TXRH","CAKE",
  "AMZN","WMT","TGT","COST","KR","ACI","SFM","CASY","BJ","GO",
  "CVS","WBA","RAD","CAH","MCK","ABC","HSIC","PDCO","XRAY","VTRS",
  "BA","LMT","RTX","NOC","GD","L3H","HII","TDG","HEI","AXON",
  "CAT","DE","CMI","PCAR","URI","AGCO","CNHI","TITN","ASTE","TEX",
  "BHP","RIO","VALE","FCX","NEM","AEM","WPM","KGC","AGI","OR"
];

app.get("/stocks", async (req, res) => {
  try {
    const results = await Promise.allSettled(
      TICKERS.map(ticker =>
        yahooFinance.quote(ticker).then(q => ({
          ticker: q.symbol,
          name: q.longName || q.shortName || q.symbol,
          sector: q.sector || "Unknown",
          price: q.regularMarketPrice || 0,
          marketCap: q.marketCap ? +(q.marketCap / 1e9).toFixed(1) : 0,
          pe: q.forwardPE ? +q.forwardPE.toFixed(1) : null,
          ebitdaGrowth: q.earningsGrowth ? +(q.earningsGrowth * 100).toFixed(1) : null,
          revenueGrowth: q.revenueGrowth ? +(q.revenueGrowth * 100).toFixed(1) : null,
          margin: q.profitMargins ? +(q.profitMargins * 100).toFixed(1) : null,
          debtEquity: q.debtToEquity ? +(q.debtToEquity / 100).toFixed(2) : null,
          divYield: q.dividendYield ? +(q.dividendYield * 100).toFixed(2) : 0,
          beta: q.beta ? +q.beta.toFixed(2) : null,
          volatility: q["52WeekChange"] ? +(Math.abs(q["52WeekChange"]) * 100).toFixed(1) : null,
        }))
      )
    );

    const stocks = results
      .filter(r => r.status === "fulfilled" && r.value.marketCap > 0)
      .map(r => r.value);

    res.json(stocks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Running!"));
