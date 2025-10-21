import fetchURL from "../../utils/fetchURL";
import { FetchResult, SimpleAdapter, FetchOptions } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import asyncRetry from "async-retry";

const startTimestampArbitrum = 1714608000; // 02.05.2024
const startTimestampBsc = 1717200000; // 01.06.2024
const startTimestampBase = 1722470400; // 01.08.2024
const startTimestampHyperliquid = 1730678400; // 04.11.2024

interface StatisticsItemRaw {
  dailyVolume: string;
  network: string | null;
  protocol: string;
  totalVolume: string;
}

interface StatisticsItem {
  dailyVolume: number;
  network?: string | null;
  protocol?: string;
  totalVolume: number;
}

async function fetchStatistics(startOfDay: number): Promise<StatisticsItem[]> {
  const data = (await asyncRetry(
    async () =>
      fetchURL(
        `https://vooi-rebates.fly.dev/defillama/volumes?ts=${startOfDay}`
      ),
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2,
    }
  )) as StatisticsItemRaw[];

  return data.map((item) => ({
    ...item,
    dailyVolume: Number(item.dailyVolume),
    totalVolume: Number(item.totalVolume),
  }));
}

const fetchArbitrum = async (
  timestamp: number,
  _t: any,
  options: FetchOptions
): Promise<FetchResult> => {
  const data = await fetchStatistics(options.startOfDay);
  const { dailyVolume, totalVolume } = data.reduce(
    (acc, item) => {
      if (item.protocol == "ostium") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      if (item.protocol == "gmx" && item.network == "arbitrum") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      if (item.protocol == "gains" && item.network == "arbitrum") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      if (item.protocol == "synfutures") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      return acc;
    },
    { dailyVolume: 0, totalVolume: 0 }
  );
  return {
    dailyVolume,
    totalVolume,
    timestamp,
  };
};

const fetchOptimism = async (
  timestamp: number,
  _t: any,
  options: FetchOptions
): Promise<FetchResult> => {
  const data = await fetchStatistics(options.startOfDay);
  const { dailyVolume, totalVolume } = data.reduce(
    (acc, item) => {
      if (item.protocol == "orderly") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      return acc;
    },
    { dailyVolume: 0, totalVolume: 0 }
  );

  return {
    dailyVolume: dailyVolume,
    totalVolume: totalVolume,
    timestamp,
  };
};

const fetchHyperliquid = async (
  timestamp: number,
  _t: any,
  options: FetchOptions
): Promise<FetchResult> => {
  const data = await fetchStatistics(options.startOfDay);

  const { dailyVolume, totalVolume } = data.reduce(
    (acc, item) => {
      if (item.protocol == "hyperliquid") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      return acc;
    },
    { dailyVolume: 0, totalVolume: 0 }
  );
  return {
    dailyVolume: dailyVolume,
    totalVolume: totalVolume,
    timestamp,
  };
};

const fetchBsc = async (
  timestamp: number,
  _t: any,
  options: FetchOptions
): Promise<FetchResult> => {
  const data = await fetchStatistics(options.startOfDay);

  const { dailyVolume, totalVolume } = data.reduce(
    (acc, item) => {
      if (item.protocol == "kiloex" && item.network != "base") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      return acc;
    },
    { dailyVolume: 0, totalVolume: 0 }
  );

  return {
    dailyVolume: dailyVolume,
    totalVolume: totalVolume,
    timestamp,
  };
};

const fetchBase = async (
  timestamp: number,
  _t: any,
  options: FetchOptions
): Promise<FetchResult> => {
  const data = await fetchStatistics(options.startOfDay);
  const { dailyVolume, totalVolume } = data.reduce(
    (acc, item) => {
      if (item.protocol == "kiloex" && item.network === "base") {
        acc.dailyVolume += item.dailyVolume;
        acc.totalVolume += item.totalVolume;
      }
      return acc;
    },
    { dailyVolume: 0, totalVolume: 0 }
  );
  return {
    dailyVolume: dailyVolume,
    totalVolume: totalVolume,
    timestamp,
  };
};

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.ARBITRUM]: {
      fetch: fetchArbitrum,
      start: startTimestampArbitrum,
    },
    [CHAIN.OPTIMISM]: {
      fetch: fetchOptimism,
      start: startTimestampArbitrum,
    },
    [CHAIN.BSC]: {
      fetch: fetchBsc,
      start: startTimestampBsc,
    },
    [CHAIN.BASE]: {
      fetch: fetchBase,
      start: startTimestampBase,
    },
    [CHAIN.HYPERLIQUID]: {
      fetch: fetchHyperliquid,
      start: startTimestampHyperliquid,
    },
  },
};
export default adapter;
