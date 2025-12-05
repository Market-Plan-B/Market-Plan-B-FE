import axios from "axios";

// 공통 타입
interface BaseQuote {
  value: number;
  change?: number;
  changePercent?: number;
}
interface OilPrice extends BaseQuote {
  price: number;
  prevClose: number;
}

// === [ 핵심: 3개 기능 적용한 fetchYahoo ] =====================
const fetchYahoo = async (symbol: string, retries = 5): Promise<any> => {
  let delay = 1000; // 최초 대기 1초 (지수 백오프 시작점)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `/yahoo-finance/${symbol}`;
      const { data } = await axios.get(url, {
        timeout: 8000,
        headers: {
          // User-Agent 우회 ★ (봇 탐지 우회)
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

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
    } catch (err: any) {
      // 429 또는 네트워크 오류 감지
      if (err?.response?.status === 429) {
        console.warn(
          `[429] ${symbol} → ${attempt}차 재시도 예정 (대기 ${delay / 1000}s)`
        );
      } else {
        console.warn(
          `[에러] ${symbol} → ${attempt}차 재시도 (대기 ${delay / 1000}s):`,
          err
        );
      }

      // 마지막 시도면 실패 처리
      if (attempt === retries) throw err;

      // 지수 백오프 적용 ★
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // 대기 시간을 2배씩 증가
    }
  }

  throw new Error(`Yahoo fetch failed: ${symbol}`);
};

// ==================================================

const safe = <T>(fn: () => Promise<T>, fallback: T) =>
  fn().catch((e) => {
    console.error("API Error:", e);
    return fallback;
  });

// 🛢️ 원유 가격
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
