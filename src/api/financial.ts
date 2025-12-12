import axios from "axios";

const BACKEND_API =
  "https://oil-api.skala25a.project.skala-ai.com/api/financial";

interface OilPrice {
  price: number;
  value: number;
  prevClose: number;
  change?: number;
  changePercent?: number;
}

export interface FinancialData {
  brent: any;
  wti: any;
  crack: { value: number };
  naturalGas: { value: number; change: number };
  heatingOil: { value: number; change: number }; // RBOB Gasoline (RB=F)
  usdkrw: { price: number };
  cnyusd: { price: number };
  eurusd: { price: number; change: number };
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
  heatingOil: number[];
  dxy: number[];
  sp500: number[];
  vix: number[];
  gold: number[];
  copper: number[];
  us10y: number[];
  us2y: number[];
  eurusd: number[];
}

const fetchYahoo = async (symbol: string): Promise<any> => {
  const { data } = await axios.get(`${BACKEND_API}/${symbol}`, {
    timeout: 10000,
  });
  return {
    price: data.price ?? 0,
    prevClose: data.prevClose ?? 0,
    change: data.change ?? 0,
    changePercent: data.changePercent ?? 0,
  };
};

const safe = <T>(fn: () => Promise<T>, fallback: T) =>
  fn().catch(() => fallback);

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
  safe(async () => ({ price: (await fetchYahoo("KRW=X")).price }), {
    price: 0,
  });

export const getCNYUSD = () =>
  safe(async () => ({ price: (await fetchYahoo("CNYUSD=X")).price }), {
    price: 0,
  });

export const getDXY = () =>
  safe(
    async () => {
      const d = await fetchYahoo("DX-Y.NYB");
      return { index: d.price, change: d.changePercent };
    },
    { index: 0, change: 0 }
  );

export const getUS10Y = () =>
  safe(async () => ({ rate: (await fetchYahoo("^TNX")).price }), { rate: 0 });

export const getUS2Y = () =>
  safe(async () => ({ rate: (await fetchYahoo("^IRX")).price }), { rate: 0 });

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

export const loadAllFinancialData = async (): Promise<FinancialData> => {
  const response = await axios.get(`${BACKEND_API}/all`, { timeout: 30000 });
  const d = response.data.data;

  // USD/CNY 데이터 - 백엔드 API에서 가져오기 (CNYUSD=X 티커 사용)
  const eurusdData = {
    price: d["CNYUSD=X"]?.price ?? 0,
    change: d["CNYUSD=X"]?.changePercent ?? 0,
  };

  return {
    brent: {
      price: d["BZ=F"]?.price ?? 0,
      value: d["BZ=F"]?.price ?? 0,
      prevClose: d["BZ=F"]?.prevClose ?? 0,
      change: d["BZ=F"]?.change ?? 0,
      changePercent: d["BZ=F"]?.changePercent ?? 0,
    },
    wti: {
      price: d["CL=F"]?.price ?? 0,
      value: d["CL=F"]?.price ?? 0,
      prevClose: d["CL=F"]?.prevClose ?? 0,
      change: d["CL=F"]?.change ?? 0,
      changePercent: d["CL=F"]?.changePercent ?? 0,
    },
    crack: { value: (d["RB=F"]?.price ?? 0) * 42 - (d["CL=F"]?.price ?? 0) },
    naturalGas: {
      value: d["NG=F"]?.price ?? 0,
      change: d["NG=F"]?.changePercent ?? 0,
    },
    heatingOil: {
      // RBOB Gasoline (RB=F) - 휘발유 선물
      value: d["RB=F"]?.price ?? 0,
      change: d["RB=F"]?.changePercent ?? 0,
    },
    usdkrw: { price: d["KRW=X"]?.price ?? 0 },
    cnyusd: { price: d["CNYUSD=X"]?.price ?? 0 },
    eurusd: {
      // USD/CNY 데이터 (백엔드 API에서 가져옴 - CNYUSD=X 티커)
      price: eurusdData.price,
      change: eurusdData.change,
    },
    dxy: {
      index: d["DX-Y.NYB"]?.price ?? 0,
      change: d["DX-Y.NYB"]?.changePercent ?? 0,
    },
    us10y: { rate: d["^TNX"]?.price ?? 0 },
    us2y: { rate: d["^IRX"]?.price ?? 0 },
    sp500: {
      value: d["^GSPC"]?.price ?? 0,
      change: d["^GSPC"]?.changePercent ?? 0,
    },
    vix: {
      value: d["^VIX"]?.price ?? 0,
      change: d["^VIX"]?.changePercent ?? 0,
    },
    gold: {
      value: d["GC=F"]?.price ?? 0,
      change: d["GC=F"]?.changePercent ?? 0,
    },
    copper: {
      value: d["HG=F"]?.price ?? 0,
      change: d["HG=F"]?.changePercent ?? 0,
    },
  };
};

// 7일 일별 히스토리
const fetchDailyHistory = async (
  symbol: string,
  days = 7
): Promise<number[]> => {
  try {
    const { data } = await axios.get(
      `/yahoo-finance/${symbol}?range=${days}d&interval=1d`,
      { timeout: 8000 }
    );
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!closes) return [];
    return closes.filter((v: number | null) => v !== null) as number[];
  } catch {
    return [];
  }
};

const fetchHistoryFromBackend = async (
  symbol: string,
  days = 7
): Promise<number[]> => {
  try {
    const { data } = await axios.get(`${BACKEND_API}/history`, {
      params: { symbol, days },
      timeout: 8000,
    });
    return Array.isArray(data?.history) ? data.history : [];
  } catch {
    return [];
  }
};

const fetchHistory = async (symbol: string, days = 7): Promise<number[]> => {
  const daily = await fetchDailyHistory(symbol, days);
  if (daily.length) return daily;

  const backend = await fetchHistoryFromBackend(symbol, days);
  if (backend.length) return backend;

  return [];
};

export const loadAllHistoryData = async (days = 7): Promise<HistoryData> => {
  const symbols = [
    "BZ=F",
    "CL=F",
    "NG=F",
    "RB=F",
    "DX-Y.NYB",
    "^GSPC",
    "^VIX",
    "GC=F",
    "HG=F",
    "^TNX",
    "^IRX",
    "CNYUSD=X",
  ];
  const results = await Promise.all(symbols.map((s) => fetchHistory(s, days)));

  return {
    brent: results[0],
    wti: results[1],
    naturalGas: results[2],
    heatingOil: results[3],
    dxy: results[4],
    sp500: results[5],
    vix: results[6],
    gold: results[7],
    copper: results[8],
    us10y: results[9],
    us2y: results[10],
    eurusd: results[11],
  };
};
