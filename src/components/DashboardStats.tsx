import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AdminStats, Order, Product, Category, User } from '../types';

interface DashboardStatsProps {
  stats: AdminStats | null;
  orders?: Order[];
  products?: Product[];
  categories?: Category[];
  users?: User[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

type ChartViewMode = 'combined' | 'revenue' | 'volume' | 'categories';
type TimeRange = '7d' | '14d' | '30d' | 'all';

const CATEGORY_COLORS = [
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6'  // Teal
];

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  orders = [],
  products = [],
  categories = [],
  users = [],
  onRefresh,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('combined');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Process & format salesData for Recharts
  const chartData = useMemo(() => {
    if (!stats || !stats.salesData || stats.salesData.length === 0) {
      // Fallback baseline data if no recorded dates
      const today = new Date();
      const fallback = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        fallback.push({
          rawDate: dateStr,
          date: formatted,
          sales: 0,
          orders: 0,
          avgOrderValue: 0
        });
      }
      return fallback;
    }

    // Sort chronologically
    const sorted = [...stats.salesData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let filtered = sorted;
    if (timeRange === '7d') {
      filtered = sorted.slice(-7);
    } else if (timeRange === '14d') {
      filtered = sorted.slice(-14);
    } else if (timeRange === '30d') {
      filtered = sorted.slice(-30);
    }

    return filtered.map(item => {
      // Format date label
      let formattedDate = item.date;
      try {
        const parts = item.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch {
        formattedDate = item.date;
      }

      const avgOrderValue = item.orders > 0 ? Number((item.sales / item.orders).toFixed(2)) : 0;

      return {
        rawDate: item.date,
        date: formattedDate,
        sales: Number(item.sales.toFixed(2)),
        orders: item.orders,
        avgOrderValue
      };
    });
  }, [stats, timeRange]);

  // Aggregate Key Performance Indicators (KPIs)
  const kpis = useMemo(() => {
    const totalRevenue = stats?.totalRevenue || 0;
    const totalOrders = stats?.totalOrders || 0;
    const totalProducts = stats?.totalProducts || products.length;
    const totalUsers = stats?.totalUsers || users.length;
    const pendingOrders = stats?.pendingOrdersCount || 0;

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

    // Calculate peaks from chart data
    let peakRevenue = 0;
    let peakRevenueDay = '-';
    let peakVolume = 0;
    let peakVolumeDay = '-';
    let totalWindowSales = 0;
    let totalWindowOrders = 0;

    chartData.forEach(d => {
      totalWindowSales += d.sales;
      totalWindowOrders += d.orders;
      if (d.sales > peakRevenue) {
        peakRevenue = d.sales;
        peakRevenueDay = d.date;
      }
      if (d.orders > peakVolume) {
        peakVolume = d.orders;
        peakVolumeDay = d.date;
      }
    });

    const dailyAvgRevenue = chartData.length > 0 ? (totalWindowSales / chartData.length).toFixed(2) : '0.00';
    const dailyAvgOrders = chartData.length > 0 ? (totalWindowOrders / chartData.length).toFixed(1) : '0.0';

    // Top Category
    let topCategory = 'General';
    let topCategorySales = 0;
    if (stats?.categoryBreakdown) {
      stats.categoryBreakdown.forEach(c => {
        if (c.sales > topCategorySales) {
          topCategorySales = c.sales;
          topCategory = c.category;
        }
      });
    }

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      pendingOrders,
      avgOrderValue,
      peakRevenue,
      peakRevenueDay,
      peakVolume,
      peakVolumeDay,
      dailyAvgRevenue,
      dailyAvgOrders,
      topCategory,
      topCategorySales
    };
  }, [stats, products.length, users.length, chartData]);

  // Category Pie Data
  const pieCategoryData = useMemo(() => {
    if (!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) return [];
    return stats.categoryBreakdown
      .filter(c => c.sales > 0 || c.count > 0)
      .map(c => ({
        name: c.category,
        sales: c.sales,
        count: c.count
      }));
  }, [stats?.categoryBreakdown]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 backdrop-blur-xl border border-white/15 p-3.5 rounded-2xl shadow-2xl space-y-2 text-xs min-w-44">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {label}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const isRevenue = entry.dataKey === 'sales';
              const isOrders = entry.dataKey === 'orders';
              const isAvg = entry.dataKey === 'avgOrderValue';

              let labelName = entry.name;
              let valFormatted = entry.value;

              if (isRevenue) {
                labelName = 'Total Revenue';
                valFormatted = `$${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              } else if (isOrders) {
                labelName = 'Orders Volume';
                valFormatted = `${entry.value} orders`;
              } else if (isAvg) {
                labelName = 'Avg Order Value';
                valFormatted = `$${Number(entry.value).toFixed(2)}`;
              }

              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {labelName}:
                  </span>
                  <span className="font-extrabold text-white font-mono">{valFormatted}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Pie Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalRevenue = stats?.totalRevenue || 1;
      const percent = ((data.value / Math.max(1, totalRevenue)) * 100).toFixed(1);

      return (
        <div className="bg-slate-950/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill }} />
            {data.name}
          </div>
          <div className="flex justify-between gap-4 text-slate-400">
            <span>Sales:</span>
            <span className="font-bold text-cyan-300">${Number(data.value).toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-400 text-[10px]">
            <span>Share of Revenue:</span>
            <span className="font-semibold text-white">{percent}%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-400 text-[10px]">
            <span>Catalog Items:</span>
            <span className="font-semibold text-slate-300">{data.payload.count} products</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="dashboard-stats-component">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Revenue & Order Volume Analytics
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing daily revenue trends, order counts, customer engagement, and category distributions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Time Range Selector */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
            {(['7d', '14d', '30d', 'all'] as TimeRange[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  timeRange === t
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All' : t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh /admin/stats data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Store Sales</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> AOV: ${kpis.avgOrderValue}
            </span>
            <span className="text-slate-500 text-[10px]">COD & Prepaid</span>
          </div>
        </div>

        {/* Total Orders Volume */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Orders Count</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {kpis.totalOrders}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {kpis.pendingOrders} awaiting dispatch
            </span>
            <span className="text-slate-500 text-[10px]">Active</span>
          </div>
        </div>

        {/* Daily Average Revenue */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Daily Avg Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${kpis.dailyAvgRevenue}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">
              Peak: ${kpis.peakRevenue.toFixed(0)} ({kpis.peakRevenueDay})
            </span>
          </div>
        </div>

        {/* Registered Customers & Items */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Customer Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {kpis.totalUsers}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-semibold">
              {kpis.totalProducts} Catalog Items
            </span>
            <span className="text-slate-500 text-[10px]">Verified IDs</span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Chart View Header & Switchers */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              {viewMode === 'combined' && 'Daily Revenue ($) & Order Volume Trends'}
              {viewMode === 'revenue' && 'Daily Revenue Progression ($)'}
              {viewMode === 'volume' && 'Daily Order Volume (Units)'}
              {viewMode === 'categories' && 'Sales by Product Category Breakdown'}
            </h3>
            <p className="text-xs text-slate-400">
              {viewMode === 'combined' && 'Dual-axis comparison displaying gross daily sales alongside completed order volume.'}
              {viewMode === 'revenue' && 'Area visualization showing daily fluctuations in total dollar sales.'}
              {viewMode === 'volume' && 'Bar breakdown measuring total customer order transactions placed each day.'}
              {viewMode === 'categories' && 'Proportional distribution of store revenue across active product lines.'}
            </p>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 self-stretch md:self-auto overflow-x-auto">
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 ${
                viewMode === 'combined'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Combined
            </button>
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 ${
                viewMode === 'revenue'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Revenue
            </button>
            <button
              onClick={() => setViewMode('volume')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 ${
                viewMode === 'volume'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 ${
                viewMode === 'categories'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Categories
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-80 sm:h-96">
          {/* VIEW 1: COMBINED REVENUE & ORDER VOLUME */}
          {viewMode === 'combined' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                {/* Left Axis: Revenue ($) */}
                <YAxis
                  yAxisId="left"
                  stroke="#06b6d4"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `$${val}`}
                />
                {/* Right Axis: Order Volume */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={val => `${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                  iconType="circle"
                />
                {/* Daily Revenue Area */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  name="Daily Revenue ($)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#cyanGradient)"
                  activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                />
                {/* Daily Order Volume Bar */}
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Orders Count"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  opacity={0.85}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* VIEW 2: REVENUE ONLY */}
          {viewMode === 'revenue' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#3b82f6"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Total Revenue ($)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* VIEW 3: VOLUME ONLY */}
          {viewMode === 'volume' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#f59e0b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={val => `${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} iconType="circle" />
                <Bar
                  dataKey="orders"
                  name="Daily Order Volume"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* VIEW 4: CATEGORY BREAKDOWN */}
          {viewMode === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center gap-6">
              {/* Category Pie Chart */}
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieCategoryData}
                      dataKey="sales"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {pieCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend & Metrics Table */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Category Revenue Share
                </h4>
                {pieCategoryData.map((cat, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  const percent = ((cat.sales / Math.max(1, kpis.totalRevenue)) * 100).toFixed(1);
                  return (
                    <div
                      key={cat.name}
                      className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-bold text-white">{cat.name}</span>
                        <span className="text-[10px] text-slate-400">({cat.count} prods)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-cyan-300">${cat.sales.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{percent}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Insights & Quick Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Peak Sales Day</div>
            <div className="text-sm font-black text-white">
              ${kpis.peakRevenue.toFixed(2)}{' '}
              <span className="text-xs font-normal text-cyan-400">({kpis.peakRevenueDay})</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Highest Order Volume</div>
            <div className="text-sm font-black text-white">
              {kpis.peakVolume} Orders{' '}
              <span className="text-xs font-normal text-amber-300">({kpis.peakVolumeDay})</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Top Performing Category</div>
            <div className="text-sm font-black text-white">
              {kpis.topCategory}{' '}
              <span className="text-xs font-normal text-emerald-400">(${kpis.topCategorySales.toFixed(2)})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
