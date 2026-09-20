import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bitcoin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";

import "./CryptoDashboard.css";

import type { AppDispatch } from "../../stores/store";

import {
  fetchCryptoMarket,
  fetchCryptoCoins,
  fetchCryptoMarketStatus,
  selectCryptoMarket,
  selectCryptoCoins,
  selectCryptoMarketStatus,
  selectCryptoLoading,
  selectCryptoError,
} from "../../features/trade/cryptoSlice";

function formatPrice(value: number) {
  const number = Number(value || 0);

  if (!number) {
    return "-";
  }

  if (number >= 1000) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (number >= 1) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function formatPercent(value: number) {
  const number = Number(value || 0);

  if (number > 0) {
    return `+${number.toFixed(2)}%`;
  }

  if (number < 0) {
    return `${number.toFixed(2)}%`;
  }

  return "0.00%";
}

function formatVolume(value: number) {
  const number = Number(value || 0);

  if (!number) {
    return "-";
  }

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(2)}B`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(2)}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(2)}K`;
  }

  return number.toLocaleString("en-US");
}

function formatMarketCap(value: number) {
  const number = Number(value || 0);

  if (!number) {
    return "-";
  }

  if (number >= 1_000_000_000_000) {
    return `$${(number / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (number >= 1_000_000_000) {
    return `$${(number / 1_000_000_000).toFixed(2)}B`;
  }

  if (number >= 1_000_000) {
    return `$${(number / 1_000_000).toFixed(2)}M`;
  }

  return `$${number.toLocaleString("en-US")}`;
}

function formatTime(timestamp?: string) {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusClass(changePercent: number) {
  if (changePercent > 0) {
    return "positive";
  }

  if (changePercent < 0) {
    return "negative";
  }

  return "neutral";
}

function getStatusLabel(changePercent: number) {
  if (changePercent > 0) {
    return "UP";
  }

  if (changePercent < 0) {
    return "DOWN";
  }

  return "FLAT";
}

export default function CryptoDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const market = useSelector(selectCryptoMarket);

  const coins = useSelector(selectCryptoCoins);

  const marketStatus = useSelector(selectCryptoMarketStatus);

  const loading = useSelector(selectCryptoLoading);

  const error = useSelector(selectCryptoError);

  useEffect(() => {
    dispatch(fetchCryptoMarket());

    dispatch(
      fetchCryptoCoins({
        limit: 20,
        offset: 0,
      }),
    );

    dispatch(fetchCryptoMarketStatus());
  }, [dispatch]);

  const refreshMarket = () => {
    dispatch(fetchCryptoMarket());

    dispatch(
      fetchCryptoCoins({
        limit: 20,
        offset: 0,
      }),
    );

    dispatch(fetchCryptoMarketStatus());
  };

  const totalCoins = market?.totalCoins ?? coins.length;

  const advancers =
    market?.advancers ?? coins.filter((coin) => coin.changePercent > 0).length;

  const decliners =
    market?.decliners ?? coins.filter((coin) => coin.changePercent < 0).length;

  const unchanged =
    market?.unchanged ??
    coins.filter((coin) => coin.changePercent === 0).length;

  const currentStatus = marketStatus?.status || market?.marketStatus || "OPEN";

  const normalizedStatus = String(currentStatus).toUpperCase();

  const marketIsOpen =
    marketStatus?.isOpen === true || normalizedStatus === "OPEN";

  const statusClass = marketIsOpen ? "online" : "offline";

  const statusLabel = marketIsOpen ? "MARKET OPEN" : "MARKET CLOSED";

  const sortedCoins = [...coins].sort(
    (a, b) => b.changePercent - a.changePercent,
  );

  const topGainers = sortedCoins
    .filter((coin) => coin.changePercent > 0)
    .slice(0, 5);

  const topLosers = [...coins]
    .filter((coin) => coin.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const lastUpdate = market?.timestamp || coins[0]?.timestamp;

  return (
    <div className="crypto-dashboard-page">
      <header className="crypto-dashboard-header">
        <div>
          <span className="crypto-dashboard-eyebrow">
            ABN TRADING • CRYPTO MARKET
          </span>

          <h1>Crypto Dashboard</h1>

          <p>Global cryptocurrency market monitoring and analysis</p>
        </div>

        <div className="crypto-header-actions">
          <div className="crypto-server-status">
            <span className={`crypto-status-dot ${statusClass}`} />

            <div>
              <strong>{statusLabel}</strong>

              <small>ABN SERVER :5000</small>
            </div>
          </div>

          <button
            type="button"
            className="crypto-refresh-button"
            onClick={refreshMarket}
            disabled={loading}
            title="Refresh crypto market"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="crypto-error-panel">
          <div className="crypto-error-icon">
            <AlertTriangle size={18} />
          </div>

          <div>
            <strong>Crypto Data Error</strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <section className="crypto-summary-cards">
        <div className="crypto-summary-card">
          <div className="crypto-summary-icon blue">
            <Bitcoin size={21} />
          </div>

          <div className="crypto-summary-content">
            <span>Total Coins</span>

            <strong>{totalCoins}</strong>

            <small>Tracked instruments</small>
          </div>
        </div>

        <div className="crypto-summary-card">
          <div className="crypto-summary-icon green">
            <TrendingUp size={21} />
          </div>

          <div className="crypto-summary-content">
            <span>Advancers</span>

            <strong className="positive">{advancers}</strong>

            <small>Positive movement</small>
          </div>
        </div>

        <div className="crypto-summary-card">
          <div className="crypto-summary-icon red">
            <TrendingDown size={21} />
          </div>

          <div className="crypto-summary-content">
            <span>Decliners</span>

            <strong className="negative">{decliners}</strong>

            <small>Negative movement</small>
          </div>
        </div>

        <div className="crypto-summary-card">
          <div className="crypto-summary-icon gray">
            <Activity size={21} />
          </div>

          <div className="crypto-summary-content">
            <span>Unchanged</span>

            <strong>{unchanged}</strong>

            <small>No change</small>
          </div>
        </div>
      </section>

      <section className="crypto-dashboard-grid">
        <div className="crypto-dashboard-panel">
          <div className="crypto-panel-header">
            <div>
              <h2>Crypto Market Overview</h2>

              <p>Major cryptocurrency instruments monitored by ABN Trading</p>
            </div>

            <span className={`crypto-live-indicator ${statusClass}`}>
              <span className="crypto-live-dot" />

              {marketIsOpen ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>

          <div className="crypto-market-overview">
            <div className="crypto-market-main">
              <span>CRYPTO MARKET</span>

              <strong>{totalCoins}</strong>

              <small>Cryptocurrency pairs tracked</small>
            </div>

            <div className="crypto-market-stats">
              <div className="crypto-market-stat">
                <span>Advancers</span>

                <strong className="positive">{advancers}</strong>
              </div>

              <div className="crypto-market-stat">
                <span>Decliners</span>

                <strong className="negative">{decliners}</strong>
              </div>

              <div className="crypto-market-stat">
                <span>Unchanged</span>

                <strong>{unchanged}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="crypto-dashboard-panel">
          <div className="crypto-panel-header">
            <div>
              <h2>Market Status</h2>

              <p>Current Crypto market condition</p>
            </div>
          </div>

          <div className="crypto-status-list">
            <div className="crypto-status-row">
              <span>
                <Activity size={13} />
                Market
              </span>

              <strong className={marketIsOpen ? "positive" : "negative"}>
                {normalizedStatus}
              </strong>
            </div>

            <div className="crypto-status-row">
              <span>
                <BarChart3 size={13} />
                Session
              </span>

              <strong>{marketStatus?.session || "24H / 7D"}</strong>
            </div>

            <div className="crypto-status-row">
              <span>
                <Wifi size={13} />
                Timezone
              </span>

              <strong>{marketStatus?.timezone || "UTC"}</strong>
            </div>

            <div className="crypto-status-row">
              <span>
                <Bitcoin size={13} />
                Data Feed
              </span>

              <strong>
                {marketStatus?.source || market?.source || "YAHOO_FINANCE"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="crypto-dashboard-panel crypto-coins-panel">
        <div className="crypto-panel-header">
          <div>
            <h2>Major Crypto Assets</h2>

            <p>Current cryptocurrency prices and market movement</p>
          </div>

          <div className="crypto-feed-status">
            <span className={`crypto-status-dot ${statusClass}`} />

            {loading ? "Updating..." : "Connected"}
          </div>
        </div>

        <div className="crypto-table-wrapper">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>ASSET</th>
                <th>PRICE</th>
                <th>CHANGE</th>
                <th>CHANGE %</th>
                <th>HIGH</th>
                <th>LOW</th>
                <th>VOLUME</th>
                <th>MARKET CAP</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {loading && coins.length === 0 ? (
                <tr>
                  <td colSpan={10} className="crypto-table-loading">
                    Loading crypto market...
                  </td>
                </tr>
              ) : coins.length === 0 ? (
                <tr>
                  <td colSpan={10} className="crypto-table-empty">
                    No crypto assets available
                  </td>
                </tr>
              ) : (
                coins.map((coin) => {
                  const statusClass = getStatusClass(coin.changePercent);

                  return (
                    <tr key={coin.symbol}>
                      <td className="crypto-asset-name">
                        <strong>{coin.symbol}</strong>

                        <small>{coin.name || coin.symbol}</small>
                      </td>

                      <td className="price-cell">${formatPrice(coin.price)}</td>

                      <td className={`change-cell ${statusClass}`}>
                        {coin.change > 0 ? "+" : ""}
                        {formatPrice(coin.change)}
                      </td>

                      <td className={`change-cell ${statusClass}`}>
                        {formatPercent(coin.changePercent)}
                      </td>

                      <td>${formatPrice(coin.high || 0)}</td>

                      <td>${formatPrice(coin.low || 0)}</td>

                      <td className="volume-cell">
                        {formatVolume(coin.volume || 0)}
                      </td>

                      <td className="market-cap-cell">
                        {formatMarketCap(coin.marketCap || 0)}
                      </td>

                      <td>
                        <span className={`crypto-coin-status ${statusClass}`}>
                          <span />

                          {getStatusLabel(coin.changePercent)}
                        </span>
                      </td>

                      <td className="time-cell">
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

      <section className="crypto-bottom-grid">
        <div className="crypto-dashboard-panel">
          <div className="crypto-panel-header">
            <div>
              <h2>Market Leaders</h2>

              <p>Top positive and negative movements</p>
            </div>
          </div>

          <div className="crypto-leaders-grid">
            <div className="crypto-leader-column">
              <div className="crypto-leader-title positive">
                <TrendingUp size={14} />
                Top Gainers
              </div>

              {topGainers.length === 0 ? (
                <div className="crypto-empty-small">No gainers</div>
              ) : (
                topGainers.map((coin) => (
                  <div
                    className="crypto-leader-row"
                    key={`gain-${coin.symbol}`}
                  >
                    <strong>{coin.symbol}</strong>

                    <span className="positive">
                      {formatPercent(coin.changePercent)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="crypto-leader-column">
              <div className="crypto-leader-title negative">
                <TrendingDown size={14} />
                Top Losers
              </div>

              {topLosers.length === 0 ? (
                <div className="crypto-empty-small">No losers</div>
              ) : (
                topLosers.map((coin) => (
                  <div
                    className="crypto-leader-row"
                    key={`loss-${coin.symbol}`}
                  >
                    <strong>{coin.symbol}</strong>

                    <span className="negative">
                      {formatPercent(coin.changePercent)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="crypto-dashboard-panel">
          <div className="crypto-panel-header">
            <div>
              <h2>Data Feed</h2>

              <p>Market data source information</p>
            </div>
          </div>

          <div className="crypto-feed-list">
            <div className="crypto-feed-row">
              <span>Provider</span>

              <strong>{market?.source || "YAHOO_FINANCE"}</strong>
            </div>

            <div className="crypto-feed-row">
              <span>Assets</span>

              <strong>{totalCoins}</strong>
            </div>

            <div className="crypto-feed-row">
              <span>Market</span>

              <strong>CRYPTO</strong>
            </div>

            <div className="crypto-feed-row">
              <span>Session</span>

              <strong>24H / 7D</strong>
            </div>

            <div className="crypto-feed-row">
              <span>Last Update</span>

              <strong>{formatTime(lastUpdate)}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
