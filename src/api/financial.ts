import axios from "axios";

// 백엔드 API 사용
const BACKEND_API = 'http://localhost:8000/api/financial';

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

// 백엔드 API를 통한 데이터 fetch
const fetchYahoo = async (symbol: string): Promise<any> => {
  try {
    const { data } = await axios.get(`${BACKEND_API}/${symbol}`, {
      timeout: 10000,
    });
    
    return {
      price: data.price || 0,
      prevClose: data.prevClose || 0,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
    };
  } catch (err: any) {
    console.error(`Backend API error for ${symbol}:`, err);
    throw err;
  }
};

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
  try {
    const { data } = await axios.get(`${BACKEND_API}/all`, { timeout: 30000 });
    
    return {
      brent: {
        price: data['BZ=F']?.price || 0,
        value: data['BZ=F']?.price || 0,
        prevClose: data['BZ=F']?.prevClose || 0,
        change: data['BZ=F']?.change || 0,
        changePercent: data['BZ=F']?.changePercent || 0,
      },
      wti: {
        price: data['CL=F']?.price || 0,
        value: data['CL=F']?.price || 0,
        prevClose: data['CL=F']?.prevClose || 0,
        change: data['CL=F']?.change || 0,
        changePercent: data['CL=F']?.changePercent || 0,
      },
      crack: {
        value: (data['RB=F']?.price || 0) * 42 - (data['CL=F']?.price || 0),
      },
      naturalGas: {
        value: data['NG=F']?.price || 0,
        change: data['NG=F']?.changePercent || 0,
      },
      usdkrw: { price: data['KRW=X']?.price || 0 },
      cnyusd: { price: data['CNYUSD=X']?.price || 0 },
      dxy: {
        index: data['DX-Y.NYB']?.price || 0,
        change: data['DX-Y.NYB']?.changePercent || 0,
      },
      us10y: { rate: data['^TNX']?.price || 0 },
      us2y: { rate: data['^IRX']?.price || 0 },
      sp500: {
        value: data['^GSPC']?.price || 0,
        change: data['^GSPC']?.changePercent || 0,
      },
      vix: {
        value: data['^VIX']?.price || 0,
        change: data['^VIX']?.changePercent || 0,
      },
      gold: {
        value: data['GC=F']?.price || 0,
        change: data['GC=F']?.changePercent || 0,
      },
      copper: {
        value: data['HG=F']?.price || 0,
        change: data['HG=F']?.changePercent || 0,
      },
    };
  } catch (err) {
    console.error('Backend API 연결 실패:', err);
    throw new Error('백엔드 서버가 실행되지 않았습니다. python backend-api-example.py 를 실행해주세요.');
  }
};