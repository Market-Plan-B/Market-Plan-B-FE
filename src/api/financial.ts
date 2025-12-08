import axios from "axios";

interface BaseQuote {
  value: number;
  change?: number;
  changePercent?: number;
}

interface OilPrice extends BaseQuote {
  price: number;
  prevClose: number;
}

// Yahoo Finance 현재가 fetch
const fetchYahoo = async (symbol: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `/yahoo-finance/${symbol}`;
      const { data } = await axios.get(url, { timeout: 5000 });
      const quote = data.chart.result[0];
      const meta = quote.meta;
      return {
        price: meta.regularMarketPrice || 0,
        prevClose: meta.previousClose || meta.chartPreviousClose || 0,
        change:
          (meta.regularMarketPrice || 0) -
          (meta.previousClose || meta.chartPreviousClose || 0),
        changePercent: meta.previousClose
          ? (((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) /
              (meta.previousClose || 1)) *
            100
          : 0,
      };
    } catch (err) {
      console.warn(`Retry ${i + 1}/${retries} for ${symbol}:`, err);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed after ${retries} retries`);
};

// Yahoo Finance 7일 히스토리 fetch
const fetchYahooHistory = async (
  symbol: string,
  days = 7
): Promise<number[]> => {
  try {
    const url = `/yahoo-finance/${symbol}?range=${days}d&interval=1d`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const quotes = data.chart.result[0].indicators.quote[0];
    const closes = quotes.close || [];
    return closes.filter((v: number | null) => v !== null);
  } catch (err) {
    console.warn(`History fetch failed for ${symbol}:`, err);
    return [];
  }
};

const safe = <T>(fn: () => Promise<T>, fallback: T) =>
  fn().catch((e) => {
    console.error("API Error:", e);
    return fallback;
  });

// 원유 가격
export const getBrentOil = () =>
  safe(
    async (): Promise<OilPrice> => {
      const d = await fetchYahoo("BZ=F");
      return {
        price: d.price,
        value: d.price,
        prevClose: d.prevClose,
        change: d.change,
        changePercent: d.changePercent,
      };
    },
    { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 }
  );

export const getWTI = () =>
  safe(
    async (): Promise<OilPrice> => {
      const d = await fetchYahoo("CL=F");
      return {
        price: d.price,
        value: d.price,
        prevClose: d.prevClose,
        change: d.change,
        changePercent: d.changePercent,
      };
    },
    { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 }
  );

export const getCrackSpread = async () => {
  try {
    const [rb, cl] = await Promise.all([
      fetchYahoo("RB=F"),
      fetchYahoo("CL=F"),
    ]);
    return { value: rb.price * 42 - cl.price };
  } catch {
    return { value: 0 };
  }
};

export const getNaturalGas = () =>
  safe(
    async () => {
      const d = await fetchYahoo("NG=F");
      return { value: d.price, change: d.changePercent };
    },
    { value: 0, change: 0 }
  );

export const getUSDKRW = () =>
  safe(
    async () => {
      const d = await fetchYahoo("KRW=X");
      return { price: d.price };
    },
    { price: 0 }
  );

export const getCNYUSD = () =>
  safe(
    async () => {
      const d = await fetchYahoo("CNYUSD=X");
      return { price: d.price };
    },
    { price: 0 }
  );

export const getDXY = () =>
  safe(
    async () => {
      const d = await fetchYahoo("DX-Y.NYB");
      return { index: d.price, change: d.changePercent };
    },
    { index: 0, change: 0 }
  );

export const getUS10Y = () =>
  safe(
    async () => {
      const d = await fetchYahoo("^TNX");
      return { rate: d.price };
    },
    { rate: 0 }
  );

export const getUS2Y = () =>
  safe(
    async () => {
      const d = await fetchYahoo("^IRX");
      return { rate: d.price };
    },
    { rate: 0 }
  );

export const getSP500 = () =>
  safe(
    async () => {
      const d = await fetchYahoo("^GSPC");
      return { value: d.price, change: d.changePercent };
    },
    { value: 0, change: 0 }
  );

export const getVIX = () =>
  safe(
    async () => {
      const d = await fetchYahoo("^VIX");
      return { value: d.price, change: d.changePercent };
    },
    { value: 0, change: 0 }
  );

export const getGold = () =>
  safe(
    async () => {
      const d = await fetchYahoo("GC=F");
      return { value: d.price, change: d.changePercent };
    },
    { value: 0, change: 0 }
  );

export const getCopper = () =>
  safe(
    async () => {
      const d = await fetchYahoo("HG=F");
      return { value: d.price, change: d.changePercent };
    },
    { value: 0, change: 0 }
  );

export interface FinancialData {
  brent: Awaited<ReturnType<typeof getBrentOil>>;
  wti: Awaited<ReturnType<typeof getWTI>>;
  crack: { value: number };
  naturalGas: { value: number; change: number };
  usdkrw: { price: number };
  cnyusd: { price: number };
  dxy: { index: number; change: number };
  us10y: { rate: number };
  us2y: { rate: number };
  sp500: { value: number; change: number };
  vix: { value: number; change: number };
  gold: { value: number; change: number };
  copper: { value: number; change: number };
}

export interface HistoryData {
  brent: number[];
  wti: number[];
  naturalGas: number[];
  dxy: number[];
  sp500: number[];
  vix: number[];
  gold: number[];
  copper: number[];
  us10y: number[];
}

export const loadAllFinancialData = async (): Promise<FinancialData> => {
  const [
    brent,
    wti,
    crack,
    naturalGas,
    usdkrw,
    cnyusd,
    dxy,
    us10y,
    us2y,
    sp500,
    vix,
    gold,
    copper,
  ] = await Promise.all([
    getBrentOil(),
    getWTI(),
    getCrackSpread(),
    getNaturalGas(),
    getUSDKRW(),
    getCNYUSD(),
    getDXY(),
    getUS10Y(),
    getUS2Y(),
    getSP500(),
    getVIX(),
    getGold(),
    getCopper(),
  ]);
  return {
    brent,
    wti,
    crack,
    naturalGas,
    usdkrw,
    cnyusd,
    dxy,
    us10y,
    us2y,
    sp500,
    vix,
    gold,
    copper,
  };
};

export const loadAllHistoryData = async (days = 7): Promise<HistoryData> => {
  const [brent, wti, naturalGas, dxy, sp500, vix, gold, copper, us10y] =
    await Promise.all([
      fetchYahooHistory("BZ=F", days),
      fetchYahooHistory("CL=F", days),
      fetchYahooHistory("NG=F", days),
      fetchYahooHistory("DX-Y.NYB", days),
      fetchYahooHistory("^GSPC", days),
      fetchYahooHistory("^VIX", days),
      fetchYahooHistory("GC=F", days),
      fetchYahooHistory("HG=F", days),
      fetchYahooHistory("^TNX", days),
    ]);
  return { brent, wti, naturalGas, dxy, sp500, vix, gold, copper, us10y };
};
