import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";

import "./Dashboard.css";

import type { AppDispatch } from "../../stores/store";

import {
  fetchIDXMarket,
  fetchIDXStocks,
  fetchIDXMarketStatus,
  selectIDXMarket,
  selectIDXStocks,
  selectIDXMarketStatus,
  selectIDXLoading,
  selectIDXError,
} from "../../features/trade/idxSlice";

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatVolume(value: number) {
  const volume = Number(value || 0);

  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)} B`;
  }

  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)} M`;
  }

  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)} K`;
  }

  return volume.toLocaleString("id-ID");
}

function formatMarketValue(value: number) {
  const amount = Number(value || 0);

  if (amount >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toFixed(2)} T`;
  }

  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} B`;
  }

  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(2)} M`;
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getStockStatus(changePercent: number) {
  if (changePercent > 0) return "UP";
  if (changePercent < 0) return "DOWN";
  return "FLAT";
}

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const market = useSelector(selectIDXMarket);
  const stocks = useSelector(selectIDXStocks);
  const marketStatus = useSelector(selectIDXMarketStatus);
  const loading = useSelector(selectIDXLoading);
  const error = useSelector(selectIDXError);

  useEffect(() => {
    dispatch(fetchIDXMarket());

    dispatch(
      fetchIDXStocks({
        limit: 20,
        offset: 0,
      }),
    );

    dispatch(fetchIDXMarketStatus());
  }, [dispatch]);

  const marketValue = Number(market?.value || 0);
  const marketChange = Number(market?.change || 0);
  const marketChangePercent = Number(market?.changePercent || 0);

  const advancers =
    market?.advancing ??
    stocks.filter((stock) => Number(stock.changePercent || 0) > 0).length;

  const decliners =
    market?.declining ??
    stocks.filter((stock) => Number(stock.changePercent || 0) < 0).length;

  const unchanged =
    market?.unchanged ??
    stocks.filter((stock) => Number(stock.changePercent || 0) === 0).length;

  const totalStocks =
    advancers + decliners + unchanged > 0
      ? advancers + decliners + unchanged
      : stocks.length;

  const currentStatus =
    marketStatus?.status || marketStatus?.session || "CLOSED";

  const normalizedStatus = String(currentStatus).toUpperCase();

  const marketIsOpen = normalizedStatus === "OPEN";

  const marketIsPreOpen = normalizedStatus === "PRE_OPEN";

  const marketIsBreak = normalizedStatus === "BREAK";

  const marketStatusLabel = marketIsOpen
    ? "MARKET OPEN"
    : marketIsPreOpen
      ? "MARKET PRE-OPEN"
      : marketIsBreak
        ? "MARKET BREAK"
        : "MARKET CLOSED";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">ABN TRADING • IDX MARKET</span>

          <h1>IDX Dashboard</h1>

          <p>Real-time Indonesian stock market monitoring and analysis</p>
        </div>

        <div className="server-status">
          <span className={`status-dot ${marketIsOpen ? "online" : ""}`} />

          <div>
            <strong>{marketStatusLabel}</strong>

            <small>ABN SERVER :5000</small>
          </div>
        </div>
      </header>

      {error && (
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>IDX Data Error</h2>

              <p>{error}</p>
            </div>
          </div>
        </section>
      )}

      <section className="fleet-summary">
        <article className="summary-card">
          <div className="summary-icon">
            <BarChart3 size={22} />
          </div>

          <div className="summary-content">
            <span>Total Stocks</span>

            <strong>{loading ? "..." : totalStocks}</strong>
          </div>
        </article>

        <article className="summary-card moving">
          <div className="summary-icon">
            <TrendingUp size={22} />
          </div>

          <div className="summary-content">
            <span>Advancers</span>

            <strong>{loading ? "..." : advancers}</strong>
          </div>
        </article>

        <article className="summary-card idle">
          <div className="summary-icon">
            <TrendingDown size={22} />
          </div>

          <div className="summary-content">
            <span>Decliners</span>

            <strong>{loading ? "..." : decliners}</strong>
          </div>
        </article>

        <article className="summary-card offline">
          <div className="summary-icon">
            <Activity size={22} />
          </div>

          <div className="summary-content">
            <span>Unchanged</span>

            <strong>{loading ? "..." : unchanged}</strong>
          </div>
        </article>

        <article className="summary-card alarm">
          <div className="summary-icon">
            <AlertTriangle size={22} />
          </div>

          <div className="summary-content">
            <span>Market Alert</span>

            <strong>0</strong>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel map-panel">
          <div className="panel-header">
            <div>
              <h2>IDX Market Overview</h2>

              <p>Current Indonesian stock market index</p>
            </div>

            <div className="live-indicator">
              <span className={`status-dot ${marketIsOpen ? "online" : ""}`} />

              {normalizedStatus}
            </div>
          </div>

          <div className="market-overview">
            <div className="ihsg-main">
              <span>{market?.index || "IHSG"}</span>

              <strong>{market ? formatPrice(marketValue) : "..."}</strong>

              <div
                className={`ihsg-change ${
                  marketChangePercent > 0
                    ? "positive"
                    : marketChangePercent < 0
                      ? "negative"
                      : "neutral"
                }`}
              >
                {marketChangePercent > 0 ? "+" : ""}

                {marketChange.toFixed(2)}

                {" ("}

                {marketChangePercent > 0 ? "+" : ""}

                {marketChangePercent.toFixed(2)}

                {"%)"}
              </div>
            </div>

            <div className="market-data-grid">
              <div>
                <span>Volume</span>

                <strong>{formatVolume(Number(market?.volume || 0))}</strong>
              </div>

              <div>
                <span>Value</span>

                <strong>
                  {formatMarketValue(Number(market?.valueTraded || 0))}
                </strong>
              </div>

              <div>
                <span>Advancers</span>

                <strong>{advancers}</strong>
              </div>

              <div>
                <span>Decliners</span>

                <strong>{decliners}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel status-panel">
          <div className="panel-header">
            <div>
              <h2>Market Status</h2>

              <p>Current IDX market condition</p>
            </div>
          </div>

          <div className="status-list">
            <div className="status-row">
              <span className="status-label">
                <span
                  className={`status-dot ${marketIsOpen ? "online" : ""}`}
                />
                Market
              </span>

              <strong>{normalizedStatus}</strong>
            </div>

            <div className="status-row">
              <span className="status-label">
                <span className="status-dot moving-dot" />
                Advancers
              </span>

              <strong>{advancers}</strong>
            </div>

            <div className="status-row">
              <span className="status-label">
                <span className="status-dot alarm-dot" />
                Decliners
              </span>

              <strong>{decliners}</strong>
            </div>

            <div className="status-row">
              <span className="status-label">
                <span className="status-dot idle-dot" />
                Unchanged
              </span>

              <strong>{unchanged}</strong>
            </div>

            <div className="status-row">
              <span className="status-label">
                <span className="status-dot idle-dot" />
                Session
              </span>

              <strong>{marketStatus?.session || normalizedStatus}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-panel truck-panel">
        <div className="panel-header">
          <div>
            <h2>Stock Monitoring</h2>

            <p>Latest IDX stock market information</p>
          </div>

          <button
            type="button"
            className="view-all-button"
            onClick={() => {
              dispatch(fetchIDXMarket());

              dispatch(
                fetchIDXStocks({
                  limit: 100,
                  offset: 0,
                }),
              );

              dispatch(fetchIDXMarketStatus());
            }}
          >
            Refresh
          </button>
        </div>

        <div className="truck-table-wrapper">
          <table className="truck-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Price</th>
                <th>Change</th>
                <th>Volume</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {loading
                      ? "Loading IDX market data..."
                      : "Belum ada data saham."}
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const changePercent = Number(stock.changePercent || 0);

                  const change = Number(stock.change || 0);

                  const positive = changePercent > 0;

                  const negative = changePercent < 0;

                  const status = getStockStatus(changePercent);

                  return (
                    <tr key={stock.symbol}>
                      <td>
                        <strong>{stock.symbol}</strong>
                      </td>

                      <td>{stock.company || stock.name || stock.symbol}</td>

                      <td>
                        <strong>{formatPrice(Number(stock.price || 0))}</strong>
                      </td>

                      <td>
                        <span
                          className={`stock-change ${
                            positive
                              ? "positive"
                              : negative
                                ? "negative"
                                : "neutral"
                          }`}
                        >
                          {positive ? "+" : ""}

                          {change.toFixed(0)}

                          {" ("}

                          {positive ? "+" : ""}

                          {changePercent.toFixed(2)}

                          {"%)"}
                        </span>
                      </td>

                      <td>{formatVolume(Number(stock.volume || 0))}</td>

                      <td>
                        <span
                          className={`truck-status ${status.toLowerCase()}`}
                        >
                          <span className="status-dot" />

                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel metric-panel">
          <div className="metric-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>IHSG</span>

            <strong>{formatPrice(marketValue)}</strong>

            <small
              className={
                marketChangePercent > 0
                  ? "positive"
                  : marketChangePercent < 0
                    ? "negative"
                    : "neutral"
              }
            >
              {marketChangePercent > 0 ? "+" : ""}
              {marketChangePercent.toFixed(2)}%
            </small>
          </div>
        </article>

        <article className="dashboard-panel metric-panel">
          <div className="metric-icon">
            <BarChart3 size={21} />
          </div>

          <div>
            <span>Market Volume</span>

            <strong>{formatVolume(Number(market?.volume || 0))}</strong>

            <small>Total market volume</small>
          </div>
        </article>

        <article className="dashboard-panel metric-panel">
          <div className="metric-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>Market Value</span>

            <strong>
              {formatMarketValue(Number(market?.valueTraded || 0))}
            </strong>

            <small>Estimated transaction value</small>
          </div>
        </article>

        <article className="dashboard-panel metric-panel">
          <div className="metric-icon">
            <Wifi size={21} />
          </div>

          <div>
            <span>Data Feed</span>

            <strong>{market ? "CONNECTED" : "OFFLINE"}</strong>

            <small>Yahoo Finance → ABN Server</small>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
