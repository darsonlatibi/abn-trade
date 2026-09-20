import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  Bitcoin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";

import "./BinanceDashboard.css";

/* =========================================================
 * TYPES
 * ========================================================= */

interface BinanceTicker {
  type?: string;

  symbol: string;

  binanceSymbol: string;

  price: number;

  previousClose: number;

  change: number;

  changePercent: number;

  open: number;

  high: number;

  low: number;

  volume: number;

  quoteVolume: number;

  tradeCount: number;

  bid: number;

  ask: number;

  timestamp: string;

  source: string;

  market: string;

  marketStatus: string;
}

interface BinanceRealtimeStatus {
  type?: string;

  connected: boolean;

  source: string;

  symbols: string[];

  symbolCount: number;

  cachedPrices?: number;

  timestamp: string;
}

/* =========================================================
 * CONFIG
 * ========================================================= */

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";

/* =========================================================
 * DEFAULT SYMBOLS
 * ========================================================= */

const DEFAULT_SYMBOLS = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "DOT",
  "LINK",
];

/* =========================================================
 * HELPERS
 * ========================================================= */

function formatPrice(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (value >= 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  });
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatVolume(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }

  return value.toFixed(2);
}

function formatTime(timestamp?: string) {
  if (!timestamp) {
    return "--:--:--";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }

  return date.toLocaleTimeString("id-ID", {
    hour12: false,
  });
}

function getChangeClass(value: number) {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

/* =========================================================
 * COMPONENT
 * ========================================================= */

export default function BinanceDashboard() {
  const [tickers, setTickers] = useState<Record<string, BinanceTicker>>({});

  const [realtimeStatus, setRealtimeStatus] = useState<BinanceRealtimeStatus>({
    connected: false,

    source: "BINANCE_WS",

    symbols: [],

    symbolCount: 0,

    timestamp: "",
  });

  const [socketConnected, setSocketConnected] = useState(false);

  const [lastUpdate, setLastUpdate] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
   * NATIVE WEBSOCKET /ws
   * ======================================================= */

  useEffect(() => {
    console.log("[BINANCE CLIENT] Connecting:", WS_URL);

    const ws = new WebSocket(WS_URL);

    /* -------------------------------------------------------
     * OPEN
     * ------------------------------------------------------- */

    ws.onopen = () => {
      console.log("[BINANCE CLIENT] WebSocket connected");

      setSocketConnected(true);

      /* -----------------------------------------------
       * REGISTER AS DASHBOARD
       * ----------------------------------------------- */

      ws.send(
        JSON.stringify({
          type: "DASHBOARD_CONNECT",

          client: "ABN_TRADING",

          module: "BINANCE",
        }),
      );
    };

    /* -------------------------------------------------------
     * MESSAGE
     * ------------------------------------------------------- */

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (!message?.type) {
          return;
        }

        /* =============================================
         * BINANCE TICKER
         * ============================================= */

        if (message.type === "BINANCE_TICKER") {
          const payload = message as BinanceTicker;

          if (!payload.symbol) {
            return;
          }

          const symbol = payload.symbol.toUpperCase();

          setTickers((previous) => ({
            ...previous,

            [symbol]: payload,
          }));

          setLastUpdate(payload.timestamp);

          return;
        }

        /* =============================================
         * BINANCE STATUS
         * ============================================= */

        if (message.type === "BINANCE_STATUS") {
          const status = message as BinanceRealtimeStatus;

          setRealtimeStatus(status);

          if (status.timestamp) {
            setLastUpdate(status.timestamp);
          }

          return;
        }

        /* =============================================
         * DASHBOARD CONNECTED
         * ============================================= */

        if (message.type === "DASHBOARD_CONNECTED") {
          console.log("[BINANCE CLIENT] Dashboard registered");

          return;
        }

        /* =============================================
         * SERVER CONNECTED
         * ============================================= */

        if (message.type === "CONNECTED") {
          console.log("[BINANCE CLIENT]", message.message);

          return;
        }

        /* =============================================
         * ERROR
         * ============================================= */

        if (message.type === "ERROR") {
          console.error("[BINANCE CLIENT] Server error:", message.message);
        }
      } catch (error) {
        console.error("[BINANCE CLIENT] Message parse error:", error);
      }
    };

    /* -------------------------------------------------------
     * CLOSE
     * ------------------------------------------------------- */

    ws.onclose = (event) => {
      console.warn(
        "[BINANCE CLIENT] WebSocket closed:",
        event.code,
        event.reason,
      );

      setSocketConnected(false);

      setRealtimeStatus((previous) => ({
        ...previous,

        connected: false,
      }));
    };

    /* -------------------------------------------------------
     * ERROR
     * ------------------------------------------------------- */

    ws.onerror = (error) => {
      console.error("[BINANCE CLIENT] WebSocket error:", error);

      setSocketConnected(false);
    };

    /* -------------------------------------------------------
     * CLEANUP
     * ------------------------------------------------------- */

    return () => {
      console.log("[BINANCE CLIENT] Closing WebSocket");

      ws.close();
    };
  }, []);

  /* =======================================================
   * DATA
   * ======================================================= */

  const coins = useMemo(() => {
    return DEFAULT_SYMBOLS.map((symbol) => tickers[symbol]).filter(Boolean);
  }, [tickers]);

  /* =======================================================
   * SORTED
   * ======================================================= */

  const sortedCoins = useMemo(() => {
    return [...coins].sort((a, b) => b.changePercent - a.changePercent);
  }, [coins]);

  /* =======================================================
   * GAINERS
   * ======================================================= */

  const gainers = useMemo(() => {
    return sortedCoins.filter((coin) => coin.changePercent > 0).slice(0, 5);
  }, [sortedCoins]);

  /* =======================================================
   * LOSERS
   * ======================================================= */

  const losers = useMemo(() => {
    return [...sortedCoins]
      .filter((coin) => coin.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
  }, [sortedCoins]);

  /* =======================================================
   * MARKET COUNTERS
   * ======================================================= */

  const advancers = coins.filter((coin) => coin.changePercent > 0).length;

  const decliners = coins.filter((coin) => coin.changePercent < 0).length;

  const unchanged = coins.filter((coin) => coin.changePercent === 0).length;

  /* =======================================================
   * REFRESH
   * ======================================================= */

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  /* =======================================================
   * RENDER
   * ======================================================= */

  return (
    <div className="binance-dashboard-page">
      {/* ===================================================
       * HEADER
       * =================================================== */}

      <header className="binance-dashboard-header">
        <div>
          <div className="binance-dashboard-eyebrow">
            ABN TRADING • BINANCE REALTIME
          </div>

          <h1>Binance Dashboard</h1>

          <p>
            Real-time cryptocurrency market monitoring powered by Binance
            WebSocket.
          </p>
        </div>

        <div className="binance-header-actions">
          <div
            className={`binance-server-status ${
              socketConnected ? "online" : "offline"
            }`}
          >
            {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}

            <span>
              {socketConnected ? "ABN SERVER CONNECTED" : "SERVER DISCONNECTED"}
            </span>
          </div>

          <button
            type="button"
            className="binance-refresh-button"
            onClick={handleRefresh}
          >
            <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {/* ===================================================
       * CONNECTION BAR
       * =================================================== */}

      <section className="binance-connection-bar">
        <div className="binance-connection-left">
          <span
            className={`binance-status-dot ${
              realtimeStatus.connected ? "online" : "offline"
            }`}
          />

          <strong>
            {realtimeStatus.connected ? "BINANCE REALTIME" : "BINANCE OFFLINE"}
          </strong>

          <span className="binance-connection-divider">|</span>

          <span>
            {realtimeStatus.symbolCount || DEFAULT_SYMBOLS.length} streams
          </span>
        </div>

        <div className="binance-connection-right">
          Last update <strong>{formatTime(lastUpdate)}</strong>
        </div>
      </section>

      {/* ===================================================
       * SUMMARY
       * =================================================== */}

      <section className="binance-summary-grid">
        <div className="binance-summary-card">
          <div className="binance-summary-icon blue">
            <Bitcoin size={22} />
          </div>

          <div>
            <span>Total Assets</span>

            <strong>{coins.length}</strong>
          </div>
        </div>

        <div className="binance-summary-card">
          <div className="binance-summary-icon green">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Advancers</span>

            <strong>{advancers}</strong>
          </div>
        </div>

        <div className="binance-summary-card">
          <div className="binance-summary-icon red">
            <TrendingDown size={22} />
          </div>

          <div>
            <span>Decliners</span>

            <strong>{decliners}</strong>
          </div>
        </div>

        <div className="binance-summary-card">
          <div className="binance-summary-icon gray">
            <Activity size={22} />
          </div>

          <div>
            <span>Unchanged</span>

            <strong>{unchanged}</strong>
          </div>
        </div>
      </section>

      {/* ===================================================
       * MARKET OVERVIEW
       * =================================================== */}

      <section className="binance-market-overview">
        <div className="binance-panel-header">
          <div>
            <span className="binance-panel-eyebrow">MARKET OVERVIEW</span>

            <h2>Binance Spot Market</h2>
          </div>

          <div
            className={`binance-live-indicator ${
              realtimeStatus.connected ? "online" : "offline"
            }`}
          >
            <span className="binance-live-dot" />

            {realtimeStatus.connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>

        <div className="binance-overview-grid">
          <div className="binance-overview-main">
            <div className="binance-overview-number">{coins.length}</div>

            <span>Realtime Assets</span>
          </div>

          <div className="binance-overview-stat">
            <span>Advancers</span>

            <strong className="positive">{advancers}</strong>
          </div>

          <div className="binance-overview-stat">
            <span>Decliners</span>

            <strong className="negative">{decliners}</strong>
          </div>

          <div className="binance-overview-stat">
            <span>Source</span>

            <strong>BINANCE WS</strong>
          </div>
        </div>
      </section>

      {/* ===================================================
       * ASSETS
       * =================================================== */}

      <section className="binance-panel binance-assets-panel">
        <div className="binance-panel-header">
          <div>
            <span className="binance-panel-eyebrow">REALTIME MARKET</span>

            <h2>Major Crypto Assets</h2>
          </div>

          <div className="binance-feed-badge">
            <Wifi size={14} />
            BINANCE WS
          </div>
        </div>

        <div className="binance-table-wrapper">
          <table className="binance-table">
            <thead>
              <tr>
                <th>Asset</th>

                <th>Price</th>

                <th>24H Change</th>

                <th>24H %</th>

                <th>Bid</th>

                <th>Ask</th>

                <th>24H Volume</th>

                <th>High</th>

                <th>Low</th>

                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {coins.length === 0 ? (
                <tr>
                  <td colSpan={10} className="binance-empty">
                    <BarChart3 size={28} />

                    <span>Waiting for Binance realtime data...</span>
                  </td>
                </tr>
              ) : (
                coins.map((coin) => {
                  const changeClass = getChangeClass(coin.changePercent);

                  return (
                    <tr key={coin.symbol}>
                      <td>
                        <div className="binance-asset">
                          <div className="binance-asset-icon">
                            {coin.symbol.charAt(0)}
                          </div>

                          <div>
                            <strong>{coin.symbol}</strong>

                            <span>{coin.binanceSymbol}</span>
                          </div>
                        </div>
                      </td>

                      <td className="binance-price">
                        ${formatPrice(coin.price)}
                      </td>

                      <td className={`binance-change ${changeClass}`}>
                        {coin.change >= 0 ? "+" : ""}

                        {formatPrice(Math.abs(coin.change))}
                      </td>

                      <td className={`binance-change ${changeClass}`}>
                        {formatPercent(coin.changePercent)}
                      </td>

                      <td>${formatPrice(coin.bid)}</td>

                      <td>${formatPrice(coin.ask)}</td>

                      <td className="binance-volume">
                        {formatVolume(coin.volume)}
                      </td>

                      <td>${formatPrice(coin.high)}</td>

                      <td>${formatPrice(coin.low)}</td>

                      <td className="binance-time">
                        {formatTime(coin.timestamp)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================
       * LEADERS
       * =================================================== */}

      <section className="binance-leaders-grid">
        {/* GAINERS */}

        <div className="binance-panel">
          <div className="binance-panel-header compact">
            <div>
              <span className="binance-panel-eyebrow">MARKET LEADERS</span>

              <h2>Top Gainers</h2>
            </div>

            <TrendingUp size={20} className="positive" />
          </div>

          <div className="binance-leader-list">
            {gainers.length === 0 ? (
              <div className="binance-no-data">No gainers</div>
            ) : (
              gainers.map((coin, index) => (
                <div className="binance-leader-row" key={coin.symbol}>
                  <span className="binance-rank">{index + 1}</span>

                  <strong>{coin.symbol}</strong>

                  <span>${formatPrice(coin.price)}</span>

                  <strong className="positive">
                    {formatPercent(coin.changePercent)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LOSERS */}

        <div className="binance-panel">
          <div className="binance-panel-header compact">
            <div>
              <span className="binance-panel-eyebrow">MARKET LEADERS</span>

              <h2>Top Losers</h2>
            </div>

            <TrendingDown size={20} className="negative" />
          </div>

          <div className="binance-leader-list">
            {losers.length === 0 ? (
              <div className="binance-no-data">No losers</div>
            ) : (
              losers.map((coin, index) => (
                <div className="binance-leader-row" key={coin.symbol}>
                  <span className="binance-rank">{index + 1}</span>

                  <strong>{coin.symbol}</strong>

                  <span>${formatPrice(coin.price)}</span>

                  <strong className="negative">
                    {formatPercent(coin.changePercent)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
       * FOOTER
       * =================================================== */}

      <section className="binance-feed-footer">
        <div>
          <span>DATA FEED</span>

          <strong>BINANCE WEBSOCKET</strong>
        </div>

        <div>
          <span>MARKET</span>

          <strong>CRYPTO / SPOT</strong>
        </div>

        <div>
          <span>SERVER</span>

          <strong>ABN SERVER :5000</strong>
        </div>

        <div>
          <span>STATUS</span>

          <strong
            className={realtimeStatus.connected ? "positive" : "negative"}
          >
            {realtimeStatus.connected ? "CONNECTED" : "DISCONNECTED"}
          </strong>
        </div>
      </section>
    </div>
  );
}
