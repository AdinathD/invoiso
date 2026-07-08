import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  MapPin,
  DollarSign,
  RefreshCw,
  Layers,
  Award,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  fetchSalesAnalytics,
  fetchStockAnalytics,
  type SalesAnalytics,
  type StockAnalytics
} from './apiUtils/analyticsApi';

interface AnalyticsDashboardPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AnalyticsDashboardPage({ darkMode, toggleDarkMode }: AnalyticsDashboardPageProps) {
  const [salesTimeframe, setSalesTimeframe] = useState<'day' | 'month' | 'year'>('day');
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [stockData, setStockData] = useState<StockAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory'>('overview');

  // Chart Hover States
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [hoveredCategoryIdx, setHoveredCategoryIdx] = useState<number | null>(null);

  const loadSalesData = async (timeframe: 'day' | 'month' | 'year') => {
    try {
      const sales = await fetchSalesAnalytics(timeframe);
      setSalesData(sales);
    } catch (err) {
      console.error("Error loading sales analytics:", err);
      setError("Failed to retrieve sales analytics.");
    }
  };

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sales, stock] = await Promise.all([
        fetchSalesAnalytics(salesTimeframe),
        fetchStockAnalytics()
      ]);
      setSalesData(sales);
      setStockData(stock);
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      setError("Failed to retrieve dashboard analytics. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadSalesData(salesTimeframe);
    }
  }, [salesTimeframe]);

  const formatDateLabel = (dateStr: string, timeframe: 'day' | 'month' | 'year') => {
    if (timeframe === 'year') {
      return dateStr;
    }
    if (timeframe === 'month') {
      const [year, month] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // SVG Line Chart Calculations for Sales Trend (Modern segment line chart with area gradient fill)
  const lineChartData = useMemo(() => {
    if (!salesData || salesData.salesTrend.length === 0) return null;

    const rawData = salesData.salesTrend;
    const maxVal = Math.max(...rawData.map(d => d.revenue), 1000); // Avoid dividing by 0

    const width = 600;
    const height = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = rawData.map((d, index) => {
      const x = paddingLeft + (index / (rawData.length - 1 || 1)) * chartWidth;
      // Invert Y axis
      const y = paddingTop + chartHeight - (d.revenue / maxVal) * chartHeight;
      return { x, y, data: d };
    });

    const pathD = points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

    return { points, pathD, areaD, maxVal, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, chartWidth, chartHeight, rawData };
  }, [salesData]);

  // Donut Chart Segment Calculations for Stock Valuation
  const donutChartData = useMemo(() => {
    if (!stockData || stockData.categoryDistribution.length === 0) return null;

    const rawData = stockData.categoryDistribution;
    const totalVal = stockData.summary.totalStockValue || 1;

    // Elegant modern color palette for segments
    const colors = [
      'var(--border-emerald)', // Primary Green
      '#3b82f6', // Bright Blue
      '#a855f7', // Purple
      '#f59e0b', // Amber/Orange
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#6b7280'  // Slate Gray
    ];

    let accumulatedPercent = 0;
    const segments = rawData.map((cat, idx) => {
      const percent = (cat.value / totalVal) * 100;
      const strokeLength = (percent / 100) * 251.2; // Circumference for R=40
      const strokeOffset = 251.2 - (accumulatedPercent / 100) * 251.2;
      accumulatedPercent += percent;

      return {
        ...cat,
        percent,
        strokeLength,
        strokeOffset,
        color: colors[idx % colors.length]
      };
    });

    return { segments, totalVal };
  }, [stockData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg text-text-main flex flex-col justify-center items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-border-acc/20 border-t-border-acc rounded-full animate-spin"></div>
          <RefreshCw size={20} className="absolute text-text-acc animate-pulse" />
        </div>
        <p className="text-app-sm font-black tracking-wider uppercase text-text-sec animate-pulse">Loading Ledger Intelligence...</p>
      </div>
    );
  }

  if (error || !salesData || !stockData) {
    return (
      <div className="min-h-screen bg-app-bg text-text-main flex flex-col justify-center items-center gap-4 p-6 text-center">
        <div className="p-4 bg-alert/10 rounded-full border border-alert/30 mb-2">
          <AlertTriangle size={36} className="text-alert animate-bounce" />
        </div>
        <h2 className="text-app-lg font-black text-text-main">Dashboard Link Failed</h2>
        <p className="max-w-md text-app-xs text-text-mute font-semibold">{error || 'Unknown error occurred while generating statistics.'}</p>
        <button
          onClick={loadAllAnalytics}
          className="mt-2 px-4 py-2 bg-text-acc hover:bg-action-hover text-white text-app-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
        >
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex flex-col transition-colors duration-150">

      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3.5 border-b border-border-main bg-panel-bg/90 backdrop-blur-md sticky top-0 z-30 shrink-0 gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 hover:bg-border-main rounded-lg text-text-acc transition-colors cursor-pointer border border-border-main/50 shadow-sm"
            title="Back to Invoice Editor"
          >
            <ArrowLeft size={16} />
          </Link>
          <TrendingUp size={24} className="text-text-acc" />
          <div>
            <h1 className="text-app-md font-black tracking-tight text-text-main leading-none flex items-center gap-2">
              Invoiso.ai
            </h1>
            <span className="text-[9px] text-text-mute font-black tracking-widest uppercase">Business Analytics Panel</span>
          </div>
        </div>

        {/* Global Nav bar links */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          <Link
            to="/"
            className="px-3 py-1.5 bg-border-acc-light/10 hover:bg-border-acc-light/20 text-text-acc text-[10px] font-black uppercase tracking-wider rounded-md border border-border-acc/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            Invoice Page
          </Link>
          <Link
            to="/pos"
            className="px-3 py-1.5 bg-border-acc-light/10 hover:bg-border-acc-light/20 text-text-acc text-[10px] font-black uppercase tracking-wider rounded-md border border-border-acc/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            🖥️ POS Terminal
          </Link>
          <Link
            to="/invoices"
            className="px-3 py-1.5 bg-border-acc-light/10 hover:bg-border-acc-light/20 text-text-acc text-[10px] font-black uppercase tracking-wider rounded-md border border-border-acc/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            📄 Ledger
          </Link>
          <button
            className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-border-sec bg-text-main text-panel-bg cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02]"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* Navigation Tabs & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-0.5">
          <div className="flex gap-2">
            {(['overview', 'sales', 'inventory'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-app-xs font-black uppercase tracking-wider rounded-t-lg border-b-2 transition-all cursor-pointer ${activeTab === tab
                    ? 'border-border-acc text-text-acc bg-panel-bg shadow-sm'
                    : 'border-transparent text-text-sec hover:text-text-main hover:bg-panel-bg/30'
                  }`}
              >
                {tab === 'inventory' ? 'Stock & Inventory' : `${tab} Analytics`}
              </button>
            ))}
          </div>

          <button
            onClick={loadAllAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border-sec hover:bg-panel-bg/50 rounded-lg text-text-sec hover:text-text-main transition-all text-[10px] font-black uppercase tracking-wider self-end sm:self-auto cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw size={12} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gross Sales */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-border-acc"></div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-extrabold text-text-mute uppercase tracking-widest">Gross Sales Revenue</span>
                    <div className="p-2 rounded-lg bg-emerald-light text-text-acc shadow-inner">
                      <DollarSign size={14} />
                    </div>
                  </div>
                  <h3 className="text-app-xl font-black text-text-main tracking-tight leading-tight">
                    {formatCurrency(salesData.summary.totalRevenue)}
                  </h3>
                </div>
                <div className="mt-3 pt-2 border-t border-border-main/55 flex justify-between items-center text-[10px] text-text-mute font-bold">
                  <span>Taxable: {formatCurrency(salesData.summary.totalTaxable)}</span>
                  <span className="text-text-acc flex items-center gap-0.5"><TrendingUp size={11} /> +12.3%</span>
                </div>
              </div>

              {/* Card 2: Avg Order Value */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-text-info-badge"></div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-extrabold text-text-mute uppercase tracking-widest">Average Invoice Value</span>
                    <div className="p-2 rounded-lg bg-info-badge-bg text-text-info-badge shadow-inner">
                      <TrendingUp size={14} />
                    </div>
                  </div>
                  <h3 className="text-app-xl font-black text-text-main tracking-tight leading-tight">
                    {formatCurrency(salesData.summary.averageOrderValue)}
                  </h3>
                </div>
                <div className="mt-3 pt-2 border-t border-border-main/55 flex justify-between items-center text-[10px] text-text-mute font-bold">
                  <span>Invoices: {salesData.summary.totalInvoices}</span>
                  <span className="text-text-info-badge flex items-center gap-0.5"><TrendingUp size={11} /> Strong</span>
                </div>
              </div>

              {/* Card 3: Stock Valuation */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-border-acc"></div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-extrabold text-text-mute uppercase tracking-widest">Stock Valuation</span>
                    <div className="p-2 rounded-lg bg-border-acc-light/20 text-text-acc shadow-inner">
                      <Package size={14} />
                    </div>
                  </div>
                  <h3 className="text-app-xl font-black text-text-main tracking-tight leading-tight">
                    {formatCurrency(stockData.summary.totalStockValue)}
                  </h3>
                </div>
                <div className="mt-3 pt-2 border-t border-border-main/55 flex justify-between items-center text-[10px] text-text-mute font-bold">
                  <span>Stock Items: {stockData.summary.totalItemsCount.toFixed(0)}</span>
                  <span className="text-text-acc font-black uppercase tracking-wider">Asset</span>
                </div>
              </div>

              {/* Card 4: Stock Health */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
                <div className={`absolute top-0 left-0 w-1 h-full ${stockData.summary.lowStockCount > 0 ? 'bg-alert' : 'bg-border-acc'}`}></div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-extrabold text-text-mute uppercase tracking-widest">Inventory Warnings</span>
                    <div className={`p-2 rounded-lg ${stockData.summary.lowStockCount > 0 ? 'bg-alert/15 text-alert' : 'bg-emerald-light text-text-acc'} shadow-inner`}>
                      <AlertTriangle size={14} />
                    </div>
                  </div>
                  <h3 className="text-app-xl font-black text-text-main tracking-tight leading-tight">
                    {stockData.summary.lowStockCount} <span className="text-app-sm font-semibold text-text-mute">Low Stock</span>
                  </h3>
                </div>
                <div className="mt-3 pt-2 border-t border-border-main/55 flex justify-between items-center text-[10px] text-text-mute font-bold">
                  <span>Out of stock: {stockData.summary.outOfStockCount}</span>
                  {stockData.summary.lowStockCount > 0 ? (
                    <span className="text-alert flex items-center gap-0.5 animate-pulse"><TrendingDown size={11} /> Reorder</span>
                  ) : (
                    <span className="text-text-acc font-bold uppercase">Optimal</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Sales trend line graph */}
              <div className="lg:col-span-7 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 border-b border-border-main/40 pb-3">
                  <div>
                    <h3 className="text-app-sm font-black text-text-main mb-0.5 flex items-center gap-1.5">
                      <TrendingUp size={15} className="text-text-acc" />
                      Sales Revenue Trend
                    </h3>
                    <p className="text-[10px] text-text-mute">
                      Active {salesTimeframe === 'day' ? 'daily' : salesTimeframe === 'month' ? 'monthly' : 'yearly'} business turnover analysis
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(['day', 'month', 'year'] as const).map(tf => (
                      <button
                        key={tf}
                        onClick={() => setSalesTimeframe(tf)}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer ${
                          salesTimeframe === tf
                            ? 'border-border-acc bg-border-acc-light/15 text-text-acc shadow-inner'
                            : 'border-border-main text-text-sec hover:text-text-main hover:bg-panel-bg/30'
                        }`}
                      >
                        {tf === 'day' ? 'Day' : tf === 'month' ? 'Month' : 'Year'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="my-5 relative flex justify-center items-center">
                  {lineChartData && (
                    <svg viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`} className="w-full h-auto overflow-visible select-none text-text-main">
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--border-emerald)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--border-emerald)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Vertical grids / hover guide line */}
                      {hoveredTrendIdx !== null && (
                        <line
                          x1={lineChartData.points[hoveredTrendIdx].x}
                          y1={lineChartData.paddingTop}
                          x2={lineChartData.points[hoveredTrendIdx].x}
                          y2={lineChartData.height - lineChartData.paddingBottom}
                          stroke="var(--border-emerald)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          opacity="0.6"
                        />
                      )}

                      {/* Horizontal Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = lineChartData.paddingTop + ratio * lineChartData.chartHeight;
                        const labelValue = lineChartData.maxVal * (1 - ratio);
                        return (
                          <g key={idx}>
                            <line
                              x1={lineChartData.paddingLeft}
                              y1={y}
                              x2={lineChartData.width - lineChartData.paddingRight}
                              y2={y}
                              stroke="currentColor"
                              className="text-border-main/55"
                              strokeWidth="0.75"
                              strokeDasharray="4 4"
                            />
                            {/* Y-Axis Label */}
                            <text
                              x={lineChartData.paddingLeft - 8}
                              y={y + 3}
                              className="text-[8px] font-black text-text-mute fill-current"
                              textAnchor="end"
                            >
                              {labelValue >= 1000 ? `${(labelValue / 1000).toFixed(0)}k` : labelValue.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      <path d={lineChartData.areaD} fill="url(#areaGradient)" />

                      {/* Line Path */}
                      <path
                        d={lineChartData.pathD}
                        fill="none"
                        stroke="var(--border-emerald)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Hover Hotspots & Circles */}
                      {lineChartData.points.map((p, idx) => (
                        <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredTrendIdx(idx)} onMouseLeave={() => setHoveredTrendIdx(null)}>
                          {/* Inner glow circle on hover */}
                          {hoveredTrendIdx === idx && (
                            <circle cx={p.x} cy={p.y} r="8" fill="var(--border-emerald)" opacity="0.3" />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredTrendIdx === idx ? '5.5' : '3'}
                            fill={hoveredTrendIdx === idx ? 'var(--text-emerald)' : 'var(--bg-panel)'}
                            stroke="var(--border-emerald)"
                            strokeWidth="1.75"
                          />
                          {/* Giant invisible hover field */}
                          <rect
                            x={p.x - 10}
                            y={0}
                            width="20"
                            height={lineChartData.height}
                            fill="transparent"
                          />
                        </g>
                      ))}
                    </svg>
                  )}

                  {/* HTML Tooltip overlay */}
                  {hoveredTrendIdx !== null && lineChartData && (
                    <div
                      className="absolute bg-panel-bg border border-border-acc rounded-xl shadow-xl p-2.5 z-20 pointer-events-none text-[10px] animate-fade-in flex flex-col gap-0.5 border-l-4 border-l-border-acc min-w-[100px]"
                      style={{
                        left: `${(lineChartData.points[hoveredTrendIdx].x / lineChartData.width) * 100}%`,
                        top: `${(lineChartData.points[hoveredTrendIdx].y / lineChartData.height) * 80}%`,
                        transform: 'translate(-50%, -105%)',
                      }}
                    >
                      <span className="font-extrabold text-text-main">
                        {formatDateLabel(lineChartData.rawData[hoveredTrendIdx].date, salesTimeframe)}
                      </span>
                      <span className="text-text-acc font-black text-app-xs">
                        {formatCurrency(lineChartData.rawData[hoveredTrendIdx].revenue)}
                      </span>
                      <span className="text-text-mute text-[9px]">
                        Orders: <strong className="text-text-main">{lineChartData.rawData[hoveredTrendIdx].count}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[9px] text-text-mute font-bold border-t border-border-main pt-2 uppercase">
                  <span>{lineChartData ? formatDateLabel(lineChartData.rawData[0].date, salesTimeframe) : ''}</span>
                  <span className="text-text-acc font-black tracking-wider bg-emerald-light/60 px-2 py-0.5 rounded border border-border-acc/25">Interactive Timeline</span>
                  <span>{lineChartData ? formatDateLabel(lineChartData.rawData[lineChartData.rawData.length - 1].date, salesTimeframe) : ''}</span>
                </div>
              </div>

              {/* Modernized Category Asset Distribution Donut Chart */}
              <div className="lg:col-span-5 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-app-sm font-black text-text-main mb-0.5 flex items-center gap-1.5">
                    <Layers size={15} className="text-text-acc" />
                    Stock Asset Allocation
                  </h3>
                  <p className="text-[10px] text-text-mute">Hover sectors to view category weight and share details</p>
                </div>

                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Interactive SVG Donut element */}
                  <div className="relative flex justify-center items-center h-36">
                    {donutChartData && (
                      <svg width="140" height="140" viewBox="0 0 100 100" className="overflow-visible select-none">
                        {donutChartData.segments.map((seg, idx) => (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="9"
                            strokeDasharray={`${seg.strokeLength} ${251.2 - seg.strokeLength}`}
                            strokeDashoffset={seg.strokeOffset}
                            transform="rotate(-90 50 50)"
                            className="cursor-pointer transition-all duration-300 hover:stroke-[11.5]"
                            onMouseEnter={() => setHoveredCategoryIdx(idx)}
                            onMouseLeave={() => setHoveredCategoryIdx(null)}
                          />
                        ))}
                      </svg>
                    )}

                    {/* Centered statistics indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                      {hoveredCategoryIdx !== null && donutChartData ? (
                        <>
                          <span className="text-[9px] font-black uppercase text-text-mute tracking-wider max-w-[80px] truncate">
                            {donutChartData.segments[hoveredCategoryIdx].category}
                          </span>
                          <span className="text-[11px] font-black text-text-main">
                            {donutChartData.segments[hoveredCategoryIdx].percent.toFixed(1)}%
                          </span>
                          <span className="text-[9px] font-black text-text-acc">
                            {formatCurrency(donutChartData.segments[hoveredCategoryIdx].value)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[8px] font-black uppercase text-text-mute tracking-wider">Total Value</span>
                          <span className="text-app-sm font-black text-text-main">
                            {formatCurrency(stockData.summary.totalStockValue)}
                          </span>
                          <span className="text-[8px] font-black text-text-acc uppercase">Assets</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Color Legend */}
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {donutChartData?.segments.map((seg, idx) => (
                      <div
                        key={seg.category}
                        className={`flex items-center justify-between text-[10px] font-bold p-1 rounded transition-colors ${hoveredCategoryIdx === idx ? 'bg-border-main/55' : ''
                          }`}
                        onMouseEnter={() => setHoveredCategoryIdx(idx)}
                        onMouseLeave={() => setHoveredCategoryIdx(null)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                          <span className="text-text-sec truncate">{seg.category}</span>
                        </div>
                        <span className="text-text-main font-black text-[9px] ml-1 shrink-0">{seg.percent.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border-main pt-2 text-[9px] text-text-mute text-center uppercase font-black">
                  Asset Holding Summary
                </div>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Alerts Mini Table */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-app-sm font-black text-text-main flex items-center gap-1.5">
                      <AlertTriangle size={15} className={stockData.summary.lowStockCount > 0 ? 'text-alert animate-pulse' : 'text-text-acc'} />
                      Low Stock Alerts
                    </h3>
                    <p className="text-[10px] text-text-mute">Critical list of products requiring restocking</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="text-app-xs text-text-acc hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
                  >
                    View All <ChevronRight size={12} />
                  </button>
                </div>

                {stockData.lowStockProducts.length === 0 ? (
                  <div className="p-8 text-center text-app-xs text-text-mute border border-dashed border-border-main rounded-xl bg-app-bg/25">
                    🟢 All inventory levels are healthy and optimized.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-app-xs">
                      <thead>
                        <tr className="border-b border-border-main text-text-mute font-bold">
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2 text-right">In Stock</th>
                          <th className="pb-2 text-right">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/30">
                        {stockData.lowStockProducts.slice(0, 5).map(prod => (
                          <tr key={prod.id} className="hover:bg-app-bg/40 transition-colors">
                            <td className="py-2.5 font-bold text-text-main">{prod.name}</td>
                            <td className="py-2.5 text-text-sec">
                              <span className="px-2.5 py-0.5 rounded bg-border-main/55 text-[9px] border border-border-main font-black uppercase tracking-wider">
                                {prod.category}
                              </span>
                            </td>
                            <td className={`py-2.5 text-right font-black ${prod.stock <= 0 ? 'text-alert' : 'text-text-sec'}`}>
                              {prod.stock.toFixed(0)}
                            </td>
                            <td className="py-2.5 text-right font-bold text-text-main">{formatCurrency(prod.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Selling Products Mini Table */}
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-app-sm font-black text-text-main flex items-center gap-1.5">
                      <Award size={15} className="text-text-acc" />
                      Top Performing Products
                    </h3>
                    <p className="text-[10px] text-text-mute">Top 5 items by total quantities traded</p>
                  </div>
                </div>

                {stockData.topProducts.length === 0 ? (
                  <div className="p-8 text-center text-app-xs text-text-mute border border-dashed border-border-main rounded-xl bg-app-bg/25">
                    📉 No transaction records available. Generate invoices to view trends.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-app-xs">
                      <thead>
                        <tr className="border-b border-border-main text-text-mute font-bold">
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2 text-right">Quantity Sold</th>
                          <th className="pb-2 text-right">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/30">
                        {stockData.topProducts.map((prod, idx) => (
                          <tr key={prod.id} className="hover:bg-app-bg/40 transition-colors">
                            <td className="py-2.5 font-bold text-text-main flex items-center gap-1.5">
                              <span className="text-[10px] text-text-mute bg-border-main/60 px-1.5 py-0.5 rounded-md w-6 text-center font-black">
                                #{idx + 1}
                              </span>
                              {prod.name}
                            </td>
                            <td className="py-2.5 text-right font-black text-text-sec">
                              {prod.quantitySold.toFixed(0)}
                            </td>
                            <td className="py-2.5 text-right font-black text-text-acc">
                              {formatCurrency(prod.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sales Analytics */}
        {activeTab === 'sales' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sales Stats Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Total Sales Tax Collected</span>
                <h3 className="text-app-lg font-black text-text-main">{formatCurrency(salesData.summary.totalTax)}</h3>
                <p className="text-[10px] text-text-mute mt-1">Sum of CGST/SGST/IGST shares</p>
              </div>
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Total Billings Ledger</span>
                <h3 className="text-app-lg font-black text-text-main">{salesData.summary.totalInvoices} Invoices</h3>
                <p className="text-[10px] text-text-mute mt-1">Successfully stored credit accounts</p>
              </div>
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Avg Order Value</span>
                <h3 className="text-app-lg font-black text-text-main">{formatCurrency(salesData.summary.averageOrderValue)}</h3>
                <p className="text-[10px] text-text-mute mt-1">Average net worth of invoice baskets</p>
              </div>
            </div>

            {/* Customers & Locations Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Customers Board */}
              <div className="lg:col-span-7 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-app-sm font-black text-text-main flex items-center gap-1.5">
                    <Users size={16} className="text-text-acc" />
                    Top Customers Ledger
                  </h3>
                  <p className="text-[10px] text-text-mute">Top 5 clients based on total billing contributions</p>
                </div>

                {salesData.topCustomers.length === 0 ? (
                  <div className="p-8 text-center text-app-xs text-text-mute border border-dashed border-border-main rounded-xl">
                    No customer invoicing logs recorded.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-app-xs">
                      <thead>
                        <tr className="border-b border-border-main text-text-mute font-bold">
                          <th className="pb-2">Client Details</th>
                          <th className="pb-2 text-right">Transactions</th>
                          <th className="pb-2 text-right">Total Billing Contribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/30">
                        {salesData.topCustomers.map((cust, idx) => (
                          <tr key={cust.id} className="hover:bg-app-bg/40 transition-colors">
                            <td className="py-3">
                              <div className="font-bold text-text-main flex items-center gap-1.5">
                                <span className="text-[10px] text-text-mute bg-border-main/50 px-1.5 py-0.5 rounded-md font-black w-6 text-center">
                                  #{idx + 1}
                                </span>
                                {cust.name}
                              </div>
                              <span className="text-[10px] text-text-mute ml-7">{cust.mobile}</span>
                            </td>
                            <td className="py-3 text-right font-black text-text-sec">{cust.count} Invoices</td>
                            <td className="py-3 text-right font-black text-text-acc">{formatCurrency(cust.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Geographic distribution (states/cities) */}
              <div className="lg:col-span-5 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-app-sm font-black text-text-main flex items-center gap-1.5">
                    <MapPin size={16} className="text-text-acc" />
                    Geographic Ledger Locations
                  </h3>
                  <p className="text-[10px] text-text-mute">Client regions and city distribution</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-text-mute uppercase tracking-widest mb-2 border-b border-border-main pb-1 flex justify-between items-center">
                      <span>Statewise Ledger Share</span>
                      <span className="px-1.5 py-0.5 bg-border-main/55 rounded text-[8px] font-black text-text-sec">States</span>
                    </h4>
                    {salesData.locations.states.length === 0 ? (
                      <span className="text-[10px] text-text-mute italic">No state data logged.</span>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {salesData.locations.states.map(state => (
                          <div key={state.name} className="flex justify-between items-center text-app-xs py-0.5">
                            <span className="font-bold text-text-sec">{state.name}</span>
                            <span className="font-black bg-emerald-light/60 text-text-acc px-2 py-0.5 rounded border border-border-acc/20">{state.value} clients</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-text-mute uppercase tracking-widest mb-2 border-b border-border-main pb-1 flex justify-between items-center">
                      <span>Citywise Ledger Share</span>
                      <span className="px-1.5 py-0.5 bg-border-main/55 rounded text-[8px] font-black text-text-sec">Cities</span>
                    </h4>
                    {salesData.locations.cities.length === 0 ? (
                      <span className="text-[10px] text-text-mute italic">No city data logged.</span>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {salesData.locations.cities.map(city => (
                          <div key={city.name} className="flex justify-between items-center text-app-xs py-0.5">
                            <span className="font-bold text-text-sec">{city.name}</span>
                            <span className="font-black bg-info-badge-bg text-text-info-badge px-2 py-0.5 rounded border border-text-info-badge/20">{city.value} clients</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Inventory & Stock */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Inventory overview counts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Unique Product SKUs</span>
                <h3 className="text-app-lg font-black text-text-main">{stockData.summary.totalProducts} Products</h3>
                <p className="text-[10px] text-text-mute mt-1">Products logged in master directory</p>
              </div>
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Total Stock Weight/Items</span>
                <h3 className="text-app-lg font-black text-text-main">{stockData.summary.totalItemsCount.toFixed(1)} Units</h3>
                <p className="text-[10px] text-text-mute mt-1">Aggregated weight/quantities in store</p>
              </div>
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Low Stock Alerts</span>
                <h3 className="text-app-lg font-black text-alert">{stockData.summary.lowStockCount} SKUs</h3>
                <p className="text-[10px] text-text-mute mt-1">Items below safety threshold (10 units)</p>
              </div>
              <div className="bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-text-mute uppercase tracking-widest block mb-1">Out of Stock</span>
                <h3 className="text-app-lg font-black text-alert">{stockData.summary.outOfStockCount} SKUs</h3>
                <p className="text-[10px] text-text-mute mt-1">Zero or negative inventory balance</p>
              </div>
            </div>

            {/* Category holding tables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Detailed Low Stock Alert Table */}
              <div className="lg:col-span-8 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-app-sm font-black text-text-main flex items-center gap-1.5">
                    <Layers size={16} className="text-alert" />
                    Complete Critical Stock Ledger
                  </h3>
                  <p className="text-[10px] text-text-mute">List of all items requiring procurement</p>
                </div>

                {stockData.lowStockProducts.length === 0 ? (
                  <div className="p-8 text-center text-app-xs text-text-mute border border-dashed border-border-main rounded-xl bg-app-bg/25">
                    🟢 All product quantities are well within safe thresholds.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-app-xs">
                      <thead className="sticky top-0 bg-panel-bg z-10">
                        <tr className="border-b border-border-main text-text-mute font-bold">
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2 text-right">In Stock</th>
                          <th className="pb-2 text-right">Price per Unit</th>
                          <th className="pb-2 text-right">Procurement Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/30">
                        {stockData.lowStockProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-app-bg/40 transition-colors">
                            <td className="py-3 font-bold text-text-main">{prod.name}</td>
                            <td className="py-3 text-text-sec">
                              <span className="px-2.5 py-0.5 rounded bg-border-main/55 text-[9px] border border-border-main font-black uppercase tracking-wider">
                                {prod.category}
                              </span>
                            </td>
                            <td className={`py-3 text-right font-black ${prod.stock <= 0 ? 'text-alert' : 'text-text-sec'}`}>
                              {prod.stock.toFixed(1)}
                            </td>
                            <td className="py-3 text-right font-bold text-text-main">{formatCurrency(prod.price)}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${prod.stock <= 0
                                  ? 'bg-alert/15 text-alert border border-alert/30 animate-pulse'
                                  : 'bg-info-badge-bg text-text-info-badge border border-text-info-badge/20'
                                }`}>
                                {prod.stock <= 0 ? 'Out of Stock' : 'Reorder Alert'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Stock Categorized distribution list */}
              <div className="lg:col-span-4 bg-panel-bg border border-border-main rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <h3 className="text-app-sm font-black text-text-main mb-1">Stock Category Hold</h3>
                  <p className="text-[10px] text-text-mute">Total inventory holding value by category</p>
                </div>

                <div className="my-3 space-y-3.5">
                  {stockData.categoryDistribution.map(cat => {
                    const percentage = stockData.summary.totalStockValue > 0
                      ? (cat.value / stockData.summary.totalStockValue) * 100
                      : 0;

                    return (
                      <div key={cat.category} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-app-xs">
                          <span className="font-bold text-text-sec">{cat.category}</span>
                          <span className="font-black text-text-main">{formatCurrency(cat.value)}</span>
                        </div>
                        <div className="w-full bg-border-main h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="bg-text-acc h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-text-mute font-bold">
                          <span>{cat.count} Product SKUs</span>
                          <span>{cat.itemsCount.toFixed(0)} Units in store</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border-main pt-2 text-[9px] text-text-mute text-center uppercase font-black">
                  Asset Holding Summary
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
