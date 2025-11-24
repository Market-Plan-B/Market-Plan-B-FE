import axios from "axios";

// 🔥 .env에서 API 키 불러오기
const TWELVE_KEY = import.meta.env.VITE_TWELVEDATA_KEY;

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

// TwelveData fetch 공통 함수
const fetchTwelve = async (symbol: string) => {
  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_KEY}`;
  const { data } = await axios.get(url);
  return data;
};

const fetchTwelvePrice = async (symbol: string) => {
  const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_KEY}`;
  const { data } = await axios.get(url);
  return Number(data.price) || 0;
};

// 안전 실행 래퍼
const safe = <T>(fn: () => Promise<T>, fallback: T): Promise<T> =>
  fn().catch(() => fallback);

// ------------------------------------
// 🛢 Brent / WTI
// ------------------------------------
export const getBrentOil = () =>
  safe(
    async (): Promise<OilPrice> => {
      const d = await fetchTwelve("BZ");

      return {
        price: Number(d.close) || 0,
        value: Number(d.close) || 0,
        prevClose: Number(d.previous_close) || 0,
        change: Number(d.change) || 0,
        changePercent: Number(d.percent_change) || 0,
      };
    },
    { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 }
  );

export const getWTI = () =>
  safe(
    async (): Promise<OilPrice> => {
      const d = await fetchTwelve("CL");

      return {
        price: Number(d.close) || 0,
        value: Number(d.close) || 0,
        prevClose: Number(d.previous_close) || 0,
        change: Number(d.change) || 0,
        changePercent: Number(d.percent_change) || 0,
      };
    },
    { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 }
  );

// ------------------------------------
// Crack Spread
// ------------------------------------
export const getCrackSpread = () =>
  safe(
    async () => {
      const rb = await fetchTwelve("RB");
      const cl = await fetchTwelve("CL");

      const gasoline = Number(rb.close) || 0;
      const wti = Number(cl.close) || 0;

      return { value: gasoline * 42 - wti };
    },
    { value: 0 }
  );

// ------------------------------------
// 천연가스
// ------------------------------------
export const getNaturalGas = () =>
  safe(
    async () => {
      const d = await fetchTwelve("NG");
      return {
        value: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { value: 0, change: 0 }
  );

// ------------------------------------
// 환율/금리
// ------------------------------------
export const getUSDKRW = () =>
  safe(async () => ({ price: await fetchTwelvePrice("USD/KRW") }), {
    price: 0,
  });

export const getCNYUSD = () =>
  safe(async () => ({ price: await fetchTwelvePrice("CNY/USD") }), {
    price: 0,
  });

export const getDXY = () =>
  safe(
    async () => {
      const d = await fetchTwelve("DXY");
      return {
        index: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { index: 0, change: 0 }
  );

export const getUS10Y = () =>
  safe(
    async () => {
      const d = await fetchTwelve("TNX");
      return { rate: Number(d.close) || 0 };
    },
    { rate: 0 }
  );

export const getUS2Y = () =>
  safe(
    async () => {
      const d = await fetchTwelve("US2Y"); // 혹은 "UST2Y"
      return { rate: Number(d.close) || 0 };
    },
    { rate: 0 }
  );

// ------------------------------------
// 주요 지수
// ------------------------------------
export const getSP500 = () =>
  safe(
    async () => {
      const d = await fetchTwelve("SPX");
      return {
        value: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { value: 0, change: 0 }
  );

export const getVIX = () =>
  safe(
    async () => {
      const d = await fetchTwelve("VIX");
      return {
        value: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { value: 0, change: 0 }
  );

export const getGold = () =>
  safe(
    async () => {
      const d = await fetchTwelve("GC");
      return {
        value: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { value: 0, change: 0 }
  );

export const getCopper = () =>
  safe(
    async () => {
      const d = await fetchTwelve("HG");
      return {
        value: Number(d.close) || 0,
        change: Number(d.percent_change) || 0,
      };
    },
    { value: 0, change: 0 }
  );

// ------------------------------------
// 전체 로더
// ------------------------------------
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
