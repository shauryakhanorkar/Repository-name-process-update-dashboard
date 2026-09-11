import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, FileBarChart2, Timer } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ProjectUpdate } from '../types';

interface ReportsPageProps {
  data: ProjectUpdate[];
}

const PROCESS_STAGES = ['Quotation', 'Fabrication', 'Powder Coating', 'Assembly and Wiring', 'Testing', 'Dispatch'] as const;
type ProcessStage = (typeof PROCESS_STAGES)[number];

const STATUS_COLORS = { Completed: '#10b981', 'In Progress': '#3b82f6', 'On Hold': '#f59e0b' };

function normalizeProcess(process: string): string {
  return process.replace(/\s+updates?$/i, '').replace('Assembly & Wiring', 'Assembly and Wiring').trim();
}

function updateTime(update: ProjectUpdate): number {
  const value = Date.parse(update.timestamp || update.date);
  return Number.isNaN(value) ? 0 : value;
}

function latestUpdate(updates: ProjectUpdate[]): ProjectUpdate | null {
  return updates.reduce<ProjectUpdate | null>((latest, update) => !latest || updateTime(update) >= updateTime(latest) ? update : latest, null);
}

function formatDate(update: ProjectUpdate | null): string {
  if (!update) return 'No update recorded';
  const value = update.timestamp || update.date;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function orderStatus(updates: ProjectUpdate[]): string {
  return latestUpdate(updates)?.status || 'Pending';
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p><div className={`mt-4 h-1 w-12 rounded-full ${tone}`} /></div>;
}

export default function ReportsPage({ data }: ReportsPageProps) {
  const [selectedSO, setSelectedSO] = useState('All');
  const [selectedPanel, setSelectedPanel] = useState('All');
  const [selectedProcess, setSelectedProcess] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const orders = useMemo(() => {
    const grouped = new Map<string, ProjectUpdate[]>();
    data.forEach((update) => {
      const so = update.soNumber.trim();
      if (!so) return;
      grouped.set(so, [...(grouped.get(so) || []), update]);
    });
    return Array.from(grouped, ([soNumber, updates]) => ({ soNumber, updates }));
  }, [data]);

  const options = useMemo(() => ({
    soNumbers: orders.map((order) => order.soNumber),
    panels: Array.from(new Set(data.flatMap((item) => [item.panelName, item.panelType]).filter(Boolean))).sort(),
    processes: Array.from(new Set(data.map((item) => normalizeProcess(item.process)).filter(Boolean))).sort(),
    statuses: Array.from(new Set(data.map((item) => item.status).filter(Boolean))).sort(),
  }), [data, orders]);

  const filteredUpdates = useMemo(() => data.filter((update) => {
    const process = normalizeProcess(update.process);
    return (selectedSO === 'All' || update.soNumber === selectedSO) &&
      (selectedPanel === 'All' || update.panelName === selectedPanel || update.panelType === selectedPanel) &&
      (selectedProcess === 'All' || process === selectedProcess) &&
      (selectedStatus === 'All' || update.status === selectedStatus);
  }), [data, selectedSO, selectedPanel, selectedProcess, selectedStatus]);

  const filteredOrders = useMemo(() => orders.filter((order) => filteredUpdates.some((update) => update.soNumber === order.soNumber)), [orders, filteredUpdates]);
  const statusCounts = useMemo(() => ({
    Completed: filteredUpdates.filter((item) => item.status === 'Done' || item.status === 'Completed').length,
    'In Progress': filteredUpdates.filter((item) => item.status === 'In Progress').length,
    'On Hold': filteredUpdates.filter((item) => item.status === 'On Hold').length,
  }), [filteredUpdates]);
  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name: name as keyof typeof STATUS_COLORS, value }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);

  const processSummary = useMemo(() => PROCESS_STAGES.map((stage) => {
    const update = latestUpdate(filteredUpdates.filter((item) => normalizeProcess(item.process) === stage));
    return { stage, update };
  }), [filteredUpdates]);

  const currentProcess = (updates: ProjectUpdate[]): ProcessStage | null => {
    const update = latestUpdate(updates.filter((item) => PROCESS_STAGES.includes(normalizeProcess(item.process) as ProcessStage)));
    const process = normalizeProcess(update?.process || '') as ProcessStage;
    return PROCESS_STAGES.includes(process) ? process : null;
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1e3d] to-[#1a355e] p-6 text-white shadow-xl sm:p-8">
        <div className="relative flex items-center gap-3"><FileBarChart2 className="h-5 w-5 text-cyan-300" /><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Operations · Intelligence</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Reports</h1><p className="mt-1 text-sm text-slate-300">Production and process performance reports</p></div></div>
        <div className="relative mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['S.O. Number', selectedSO, setSelectedSO, ['All', ...options.soNumbers]],
            ['Panel', selectedPanel, setSelectedPanel, ['All', ...options.panels]],
            ['Process', selectedProcess, setSelectedProcess, ['All', ...options.processes]],
            ['Status', selectedStatus, setSelectedStatus, ['All', ...options.statuses]],
          ].map(([label, value, setter, values]) => <label key={label as string} className="relative min-w-0 text-xs font-medium text-slate-300"><span className="mb-1.5 block">{label as string}</span><span className="relative block"><select value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-white/10 px-3 py-3 pr-9 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20">{(values as string[]).map((option) => <option key={option} value={option} className="bg-[#122445] text-white">{option === 'All' ? `All ${label as string}s` : option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" /></span></label>)}
        </div>
      </section>

      {data.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No report data available.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total S.O." value={filteredOrders.length} tone="bg-blue-500" />
        <StatCard label="In Production" value={filteredOrders.filter((order) => order.updates.some((item) => item.status === 'In Progress')).length} tone="bg-cyan-500" />
        <StatCard label="Completed" value={filteredOrders.filter((order) => orderStatus(order.updates) === 'Done' || orderStatus(order.updates) === 'Completed').length} tone="bg-emerald-500" />
        <StatCard label="On Hold" value={filteredOrders.filter((order) => orderStatus(order.updates) === 'On Hold').length} tone="bg-amber-500" />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-900">Production Status</h2><p className="mt-1 text-sm text-slate-500">Selected report data</p><div className="relative mx-auto mt-4 h-52 w-full max-w-[230px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>{chartData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-slate-900">{chartTotal ? Math.round((statusCounts.Completed / chartTotal) * 100) : 0}%</span><span className="text-xs text-slate-500">Completed</span><span className="text-[10px] text-slate-400">{chartTotal} updates</span></div></div><div className="mt-3 space-y-2">{chartData.map((entry) => <div key={entry.name} className="flex justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />{entry.name}</span><span className="font-semibold text-slate-800">{entry.value} <span className="font-normal text-slate-400">({chartTotal ? Math.round((entry.value / chartTotal) * 100) : 0}%)</span></span></div>)}</div></section>

        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-900">Production Process Summary</h2><p className="mt-1 text-sm text-slate-500">Latest process state across the selected report scope</p><div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[720px] grid-cols-6 gap-2">{processSummary.map(({ stage, update }) => { const status = update?.status === 'Done' || update?.status === 'Completed' ? 'Completed' : update?.status === 'In Progress' ? 'Current Process' : update ? 'Pending' : 'Pending'; return <div key={stage} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"><div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${status === 'Completed' ? 'bg-emerald-500 text-white' : status === 'Current Process' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{status === 'Completed' ? <Check className="h-4 w-4" /> : status === 'Current Process' ? <Timer className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-slate-400" />}</div><p className="mt-2 min-h-8 break-words text-xs font-semibold text-slate-700">{stage}</p><p className="mt-1 min-h-8 text-[10px] text-slate-500">{formatDate(update)}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{status}</p></div>; })}</div></div></section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="border-b border-slate-100 p-5 sm:p-6"><h2 className="text-lg font-bold text-slate-900">Process Performance</h2><p className="mt-1 text-sm text-slate-500">Performance details from the selected report data</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['S.O. Number', 'Customer', 'Panel Name', 'Panel Type', 'Current Process', 'Status', 'Last Updated'].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map((order) => { const latest = latestUpdate(order.updates); const panel = order.updates.find((item) => item.panelName || item.panelType); return <tr key={order.soNumber}><td className="px-5 py-4 font-semibold text-slate-900">{order.soNumber}</td><td className="px-5 py-4">{panel?.customerName || 'Not available'}</td><td className="px-5 py-4">{panel?.panelName || 'Not available'}</td><td className="px-5 py-4">{panel?.panelType || 'Not available'}</td><td className="px-5 py-4">{currentProcess(order.updates) || 'No production update'}</td><td className="px-5 py-4">{latest?.status || 'Pending'}</td><td className="px-5 py-4 text-slate-500">{formatDate(latest)}</td></tr>; })}{!filteredOrders.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">No report data matches the selected filters.</td></tr>}</tbody></table></div></section>
    </div>
  );
}
