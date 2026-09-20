import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";

import "./ForexDashboard.css";

import type { AppDispatch } from "../../stores/store";

import {
  fetchForexMarket,
  fetchForexPairs,
  fetchForexMarketStatus,
  selectForexMarket,
  selectForexPairs,
  selectForexMarketStatus,
  selectForexLoading,
  selectForexError,
} from "../../features/trade/forexSlice";

function formatPrice(value: number) {
  const number = Number(value || 0);

  if (!number) return "-";

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
}

function formatPercent(value: number) {
  const number = Number(value || 0);

  if (number > 0) return `+${number.toFixed(2)}%`;
  if (number < 0) return `${number.toFixed(2)}%`;

  return "0.00%";
}

function formatSpread(value: number) {
  const number = Number(value || 0);

  if (!number) return "-";

  return number.toFixed(5);
}

function formatTime(timestamp?: string) {
  if (!timestamp) return "-";

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

function ForexDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const market = useSelector(selectForexMarket);
  const pairs = useSelector(selectForexPairs);
  const marketStatus = useSelector(selectForexMarketStatus);
  const loading = useSelector(selectForexLoading);
  const error = useSelector(selectForexError);

  useEffect(() => {
    dispatch(fetchForexMarket());
    dispatch(fetchForexPairs({ limit: 20, offset: 0 }));
    dispatch(fetchForexMarketStatus());
  }, [dispatch]);

  const refreshMarket = () => {
    dispatch(fetchForexMarket());
    dispatch(fetchForexPairs({ limit: 20, offset: 0 }));
    dispatch(fetchForexMarketStatus());
  };

  const totalPairs = market?.totalPairs ?? pairs.length;

  const advancers =
    market?.advancers ?? pairs.filter((pair) => pair.changePercent > 0).length;

  const decliners =
    market?.decliners ?? pairs.filter((pair) => pair.changePercent < 0).length;

  const unchanged =
    market?.unchanged ??
    pairs.filter((pair) => pair.changePercent === 0).length;

  const currentStatus =
    marketStatus?.status || market?.marketStatus || "CLOSED";

  const normalizedStatus = String(currentStatus).toUpperCase();

  const marketIsOpen =
    marketStatus?.isOpen === true || normalizedStatus === "OPEN";

  const marketStatusLabel =
    normalizedStatus === "OPEN"
      ? "MARKET OPEN"
      : normalizedStatus === "PRE_OPEN"
        ? "MARKET PRE-OPEN"
        : normalizedStatus === "BREAK"
          ? "MARKET BREAK"
          : "MARKET CLOSED";

  const statusClass =
    normalizedStatus === "OPEN"
      ? "online"
      : normalizedStatus === "BREAK"
        ? "warning"
        : "offline";

  return (
    <main className="forex-dashboard-page">
      <header className="forex-dashboard-header">
        <div>
          <span className="forex-dashboard-eyebrow">
            ABN TRADING • FOREX MARKET
          </span>

          <h1>Forex Dashboard</h1>

          <p>Global foreign exchange market monitoring and analysis</p>
        </div>

        <div className="forex-header-actions">
          <div className="forex-server-status">
            <span className={`forex-status-dot ${statusClass}`} />

            <div>
              <strong>{marketStatusLabel}</strong>
              <small>ABN SERVER :5000</small>
            </div>
          </div>

          <button
            type="button"
            className="forex-refresh-button"
            onClick={refreshMarket}
            disabled={loading}
            title="Refresh Forex market"
          >
            <RefreshCw size={17} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <section className="forex-error-panel">
          <div className="forex-error-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <strong>Forex Data Error</strong>
            <p>{error}</p>
          </div>
        </section>
      )}

      <section className="forex-summary-cards">
        <article className="forex-summary-card">
          <div className="forex-summary-icon blue">
            <BarChart3 size={22} />
          </div>

          <div className="forex-summary-content">
            <span>Total Pairs</span>
            <strong>{loading ? "..." : totalPairs}</strong>

            <small>Tracked instruments</small>
          </div>
        </article>

        <article className="forex-summary-card positive-card">
          <div className="forex-summary-icon green">
            <TrendingUp size={22} />
          </div>

          <div className="forex-summary-content">
            <span>Advancers</span>
            <strong>{loading ? "..." : advancers}</strong>

            <small>Positive movement</small>
          </div>
        </article>

        <article className="forex-summary-card negative-card">
          <div className="forex-summary-icon red">
            <TrendingDown size={22} />
          </div>

          <div className="forex-summary-content">
            <span>Decliners</span>
            <strong>{loading ? "..." : decliners}</strong>

            <small>Negative movement</small>
          </div>
        </article>

        <article className="forex-summary-card neutral-card">
          <div className="forex-summary-icon gray">
            <Activity size={22} />
          </div>

          <div className="forex-summary-content">
            <span>Unchanged</span>
            <strong>{loading ? "..." : unchanged}</strong>

            <small>No change</small>
          </div>
        </article>
      </section>

      <section className="forex-dashboard-grid">
        <article className="forex-dashboard-panel forex-market-panel">
          <div className="forex-panel-header">
            <div>
              <h2>Forex Market Overview</h2>
              <p>Major currency pairs monitored by ABN Trading</p>
            </div>

            <div className={`forex-live-indicator ${statusClass}`}>
              <span className="forex-live-dot" />
              {normalizedStatus}
            </div>
          </div>

          <div className="forex-market-overview">
            <div className="forex-market-main">
              <span>FOREX MARKET</span>

              <strong>{totalPairs}</strong>

              <small>Currency pairs tracked</small>
            </div>

            <div className="forex-market-stats">
              <div className="forex-market-stat">
                <span>Advancers</span>
                <strong className="positive">{advancers}</strong>
              </div>

              <div className="forex-market-stat">
                <span>Decliners</span>
                <strong className="negative">{decliners}</strong>
              </div>

              <div className="forex-market-stat">
                <span>Unchanged</span>
                <strong>{unchanged}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="forex-dashboard-panel forex-status-panel">
          <div className="forex-panel-header">
            <div>
              <h2>Market Status</h2>
              <p>Current Forex market condition</p>
            </div>
          </div>

          <div className="forex-status-list">
            <div className="forex-status-row">
              <span>
                <span className={`forex-status-dot ${statusClass}`} />
                Market
              </span>

              <strong>{normalizedStatus}</strong>
            </div>

            <div className="forex-status-row">
              <span>
                <span className="forex-status-dot online" />
                Session
              </span>

              <strong>{marketStatus?.session || "24H / 5D"}</strong>
            </div>

            <div className="forex-status-row">
              <span>
                <span className="forex-status-dot online" />
                Timezone
              </span>

              <strong>{marketStatus?.timezone || "UTC"}</strong>
            </div>

            <div className="forex-status-row">
              <span>
                <span className="forex-status-dot idle" />
                Data Feed
              </span>

              <strong>
                {marketStatus?.source || market?.source || "YAHOO_FINANCE"}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="forex-dashboard-panel forex-pairs-panel">
        <div className="forex-panel-header">
          <div>
            <h2>Major Currency Pairs</h2>
            <p>Current market prices, bid/ask and spread</p>
          </div>

          <div className="forex-feed-status">
            <Wifi size={16} />

            <span>{marketIsOpen ? "Connected" : "Standby"}</span>
          </div>
        </div>

        <div className="forex-table-wrapper">
          <table className="forex-table">
            <thead>
              <tr>
                <th>PAIR</th>
                <th>PRICE</th>
                <th>CHANGE</th>
                <th>CHANGE %</th>
                <th>BID</th>
                <th>ASK</th>
                <th>SPREAD</th>
                <th>HIGH</th>
                <th>LOW</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {loading && pairs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="forex-table-loading">
                    Loading Forex market data...
                  </td>
                </tr>
              ) : pairs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="forex-table-empty">
                    No Forex pairs available
                  </td>
                </tr>
              ) : (
                pairs.map((pair) => {
                  const changeClass =
                    pair.changePercent > 0
                      ? "positive"
                      : pair.changePercent < 0
                        ? "negative"
                        : "neutral";

                  const pairStatus = String(
                    pair.status || "FLAT",
                  ).toUpperCase();

                  return (
                    <tr key={pair.symbol}>
                      <td>
                        <div className="forex-pair-name">
                          <strong>{pair.symbol}</strong>

                          <small>{pair.name || "Currency Pair"}</small>
                        </div>
                      </td>

                      <td className="price-cell">{formatPrice(pair.price)}</td>

                      <td className={`change-cell ${changeClass}`}>
                        {pair.change > 0 ? "+" : ""}
                        {formatPrice(pair.change)}
                      </td>

                      <td className={`change-cell ${changeClass}`}>
                        {formatPercent(pair.changePercent)}
                      </td>

                      <td className="bid-cell">{formatPrice(pair.bid || 0)}</td>

                      <td className="ask-cell">{formatPrice(pair.ask || 0)}</td>

                      <td className="spread-cell">
                        {formatSpread(pair.spread || 0)}
                      </td>

                      <td>{formatPrice(pair.high || 0)}</td>

                      <td>{formatPrice(pair.low || 0)}</td>

                      <td>
                        <span className={`forex-pair-status ${changeClass}`}>
                          <span />
                          {pairStatus}
                        </span>
                      </td>

                      <td className="time-cell">
                        {formatTime(pair.timestamp)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="forex-bottom-grid">
        <article className="forex-dashboard-panel forex-leaders-panel">
          <div className="forex-panel-header">
            <div>
              <h2>Market Leaders</h2>
              <p>Top positive and negative movements</p>
            </div>
          </div>

          <div className="forex-leaders-grid">
            <div className="forex-leader-column">
              <div className="forex-leader-title positive">
                <TrendingUp size={17} />
                Top Gainers
              </div>

              {pairs
                .filter((pair) => pair.changePercent > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5)
                .map((pair) => (
                  <div
                    className="forex-leader-row"
                    key={`gainer-${pair.symbol}`}
                  >
                    <strong>{pair.symbol}</strong>

                    <span className="positive">
                      {formatPercent(pair.changePercent)}
                    </span>
                  </div>
                ))}

              {pairs.filter((pair) => pair.changePercent > 0).length === 0 && (
                <div className="forex-empty-small">No gainers</div>
              )}
            </div>

            <div className="forex-leader-column">
              <div className="forex-leader-title negative">
                <TrendingDown size={17} />
                Top Losers
              </div>

              {pairs
                .filter((pair) => pair.changePercent < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5)
                .map((pair) => (
                  <div
                    className="forex-leader-row"
                    key={`loser-${pair.symbol}`}
                  >
                    <strong>{pair.symbol}</strong>

                    <span className="negative">
                      {formatPercent(pair.changePercent)}
                    </span>
                  </div>
                ))}

              {pairs.filter((pair) => pair.changePercent < 0).length === 0 && (
                <div className="forex-empty-small">No losers</div>
              )}
            </div>
          </div>
        </article>

        <article className="forex-dashboard-panel forex-feed-panel">
          <div className="forex-panel-header">
            <div>
              <h2>Data Feed</h2>
              <p>Market data source information</p>
            </div>
          </div>

          <div className="forex-feed-list">
            <div className="forex-feed-row">
              <span>Provider</span>
              <strong>
                {market?.source || marketStatus?.source || "YAHOO_FINANCE"}
              </strong>
            </div>

            <div className="forex-feed-row">
              <span>Pairs</span>
              <strong>{pairs.length}</strong>
            </div>

            <div className="forex-feed-row">
              <span>Market</span>
              <strong>FOREX</strong>
            </div>

            <div className="forex-feed-row">
              <span>Session</span>
              <strong>{marketStatus?.session || "24H / 5D"}</strong>
            </div>

            <div className="forex-feed-row">
              <span>Last Update</span>
              <strong>{formatTime(market?.timestamp)}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default ForexDashboard;
