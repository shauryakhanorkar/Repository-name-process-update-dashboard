import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  Clock3,
  Factory,
  FileText,
  Info,
  PackageCheck,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ProjectUpdate } from '../types';

interface ProductionPageProps {
  data: ProjectUpdate[];
  selectedSONumber?: string;
}

const PRODUCTION_STAGES = [
  'Quotation',
  'Fabrication',
  'Powder Coating',
  'Assembly and Wiring',
  'Testing',
  'Dispatch',
] as const;

type ProductionStage = (typeof PRODUCTION_STAGES)[number];

interface ProductionOrder {
  soNumber: string;
  updates: ProjectUpdate[];
  productionUpdates: ProjectUpdate[];
  currentProcess: ProductionStage | null;
  status: string;
  lastUpdated: ProjectUpdate | null;
}

function normalizeProcess(process: string): string {
  return process
    .replace(/\s+updates?$/i, '')
    .replace('Assembly & Wiring', 'Assembly and Wiring')
    .trim();
}

function getUpdateTime(update: ProjectUpdate): number {
  const timestamp = update.timestamp || update.date;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDateTime(update: ProjectUpdate | null): string {
  if (!update) return 'No update recorded';

  const value = update.timestamp || update.date;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || 'No update recorded';

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function latestUpdate(updates: ProjectUpdate[]): ProjectUpdate | null {
  return updates.reduce<ProjectUpdate | null>((latest, update) => {
    if (!latest || getUpdateTime(update) >= getUpdateTime(latest)) return update;
    return latest;
  }, null);
}

function getOrderStatus(order: ProductionOrder): string {
  return order.lastUpdated?.status || order.updates[order.updates.length - 1]?.status || 'Pending';
}

function getProcessUpdate(order: ProductionOrder, stage: ProductionStage): ProjectUpdate | null {
  return latestUpdate(
    order.productionUpdates.filter((update) => normalizeProcess(update.process) === stage),
  );
}

type ProcessCardStatus = 'Completed' | 'Current Process' | 'Upcoming';

function getProcessCardStatus(
  stage: ProductionStage,
  stageIndex: number,
  currentProcess: ProductionStage | null,
  update: ProjectUpdate | null,
): ProcessCardStatus {
  if (!currentProcess) return update ? 'Completed' : 'Upcoming';

  const currentIndex = PRODUCTION_STAGES.indexOf(currentProcess);
  if (stage === currentProcess) {
    return update?.status === 'Done' || update?.status === 'Completed'
      ? 'Completed'
      : 'Current Process';
  }
  if (stageIndex < currentIndex && update) return 'Completed';
  return 'Upcoming';
}

function expectedDateLabel(): string {
  return 'Expected: Not scheduled';
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Factory;
  tone: string;
}) {
  return (
    <div className="min-h-[128px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function statusClass(status: string): string {
  if (status === 'Done' || status === 'Completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'On Hold') return 'bg-amber-50 text-amber-700';
  if (status === 'In Progress') return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-600';
}

const PRODUCTION_STATUS_COLORS = {
  Completed: '#10b981',
  'In Progress': '#3b82f6',
  'On Hold': '#f59e0b',
  Pending: '#94a3b8',
};

function ProductionStatusChart({
  data,
  completedPercentage,
}: {
  data: Array<{ name: keyof typeof PRODUCTION_STATUS_COLORS; value: number }>;
  completedPercentage: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <aside className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Production Status</h2>
      <p className="mt-1 text-sm text-slate-500">Current order distribution</p>

      <div className="relative mx-auto mt-4 h-48 w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={PRODUCTION_STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? 'Status']}
              contentStyle={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{completedPercentage}%</span>
          <span className="text-xs font-medium text-slate-500">Completed</span>
          <span className="mt-0.5 text-[10px] text-slate-400">{total} processes</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRODUCTION_STATUS_COLORS[entry.name] }} />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-800">
              {entry.value} <span className="font-normal text-slate-400">({total ? Math.round((entry.value / total) * 100) : 0}%)</span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function ProductionPage({ data, selectedSONumber: requestedSONumber }: ProductionPageProps) {
  const [selectedSONumber, setSelectedSONumber] = useState(requestedSONumber || '');
  const [tableSONumber, setTableSONumber] = useState('All');

  React.useEffect(() => {
    if (requestedSONumber) setSelectedSONumber(requestedSONumber);
  }, [requestedSONumber]);

  const orders = useMemo<ProductionOrder[]>(() => {
    const bySO = new Map<string, ProjectUpdate[]>();

    data.forEach((update) => {
      const soNumber = update.soNumber.trim();
      if (!soNumber) return;
      const updates = bySO.get(soNumber) || [];
      updates.push(update);
      bySO.set(soNumber, updates);
    });

    return Array.from(bySO.entries())
      .map(([soNumber, updates]) => {
        const productionUpdates = updates.filter((update) =>
          PRODUCTION_STAGES.includes(normalizeProcess(update.process) as ProductionStage),
        );
        const lastUpdated = latestUpdate(productionUpdates) || latestUpdate(updates);
        const currentProcess = (normalizeProcess(lastUpdated?.process || '') as ProductionStage);

        return {
          soNumber,
          updates,
          productionUpdates,
          currentProcess: PRODUCTION_STAGES.includes(currentProcess) ? currentProcess : null,
          status: getOrderStatus({
            soNumber,
            updates,
            productionUpdates,
            currentProcess: null,
            status: '',
            lastUpdated,
          }),
          lastUpdated,
        };
      })
      .sort((left, right) => left.soNumber.localeCompare(right.soNumber, undefined, { numeric: true }));
  }, [data]);

  const selectedOrder = useMemo(() => {
    if (!selectedSONumber) return orders[0] || null;
    return orders.find((order) => order.soNumber === selectedSONumber) || null;
  }, [orders, selectedSONumber]);

  const visibleOrders = useMemo(() => {
    return tableSONumber === 'All'
      ? orders
      : orders.filter((order) => order.soNumber === tableSONumber);
  }, [orders, tableSONumber]);

  const kpis = useMemo(() => ({
    total: orders.length,
    inProduction: orders.filter((order) => order.status === 'In Progress').length,
    completed: orders.filter((order) => order.status === 'Done' || order.status === 'Completed').length,
    onHold: orders.filter((order) => order.status === 'On Hold').length,
  }), [orders]);

  const productionStatusData = useMemo(() => [
    { name: 'Completed' as const, value: selectedOrder?.productionUpdates.filter((update) => update.status === 'Done' || update.status === 'Completed').length || 0 },
    { name: 'In Progress' as const, value: selectedOrder?.productionUpdates.filter((update) => update.status === 'In Progress').length || 0 },
    { name: 'On Hold' as const, value: selectedOrder?.productionUpdates.filter((update) => update.status === 'On Hold').length || 0 },
    ...(selectedOrder?.productionUpdates.some((update) => update.status === 'Pending')
      ? [{ name: 'Pending' as const, value: selectedOrder.productionUpdates.filter((update) => update.status === 'Pending').length }]
      : []),
  ], [selectedOrder]);

  const completedPercentage = useMemo(() => {
    const total = productionStatusData.reduce((sum, item) => sum + item.value, 0);
    const completed = productionStatusData.find((item) => item.name === 'Completed')?.value || 0;
    return total ? Math.round((completed / total) * 100) : 0;
  }, [productionStatusData]);

  const selectedStages = useMemo(() => {
    if (!selectedOrder) return [];
    return PRODUCTION_STAGES.map((stage) => ({
      stage,
      update: getProcessUpdate(selectedOrder, stage),
    }));
  }, [selectedOrder]);

  const selectedLastUpdate = selectedOrder ? latestUpdate(selectedOrder.productionUpdates) : null;
  const selectedPanel = selectedOrder?.updates.find((update) => update.panelName || update.panelType);
  const selectedOrderDate = selectedOrder
    ? selectedOrder.updates.reduce<ProjectUpdate | null>((earliest, update) => {
      if (!earliest || getUpdateTime(update) < getUpdateTime(earliest)) return update;
      return earliest;
    }, null)
    : null;

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              <Factory className="h-4 w-4" /> Production control
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Production</h1>
            <p className="mt-1 text-sm text-slate-500">Track and monitor production progress across all S.O.s</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total S.O." value={kpis.total} icon={FileText} tone="bg-blue-50 text-blue-600" />
        <StatCard label="In Production" value={kpis.inProduction} icon={Factory} tone="bg-cyan-50 text-cyan-600" />
        <StatCard label="Completed" value={kpis.completed} icon={PackageCheck} tone="bg-emerald-50 text-emerald-600" />
        <StatCard label="On Hold" value={kpis.onHold} icon={ShieldAlert} tone="bg-amber-50 text-amber-600" />
      </section>

      <section>
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Production Tracking</h2>
            <p className="mt-1 text-sm text-slate-500">Follow the latest recorded production update for an S.O.</p>
          </div>
          <label className="w-full text-sm font-medium text-slate-600 sm:w-72">
            <span className="mb-1.5 block">Select S.O. Number</span>
            <span className="relative block">
              <select
                value={selectedOrder?.soNumber || ''}
                onChange={(event) => setSelectedSONumber(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {!orders.length && <option value="">No S.O. data</option>}
                {orders.map((order) => <option key={order.soNumber} value={order.soNumber}>{order.soNumber}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        {!selectedOrder ? (
          <div className="py-12 text-center text-sm text-slate-500">No production data available.</div>
        ) : (
          <div className="space-y-5">
              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">S.O. Number</p><p className="mt-1 font-semibold text-slate-800">{selectedOrder.soNumber}</p></div>
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Panel Name</p><p className="mt-1 font-semibold text-slate-800">{selectedPanel?.panelName || selectedPanel?.panelType || 'Not available'}</p></div>
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Customer</p><p className="mt-1 font-semibold text-slate-800">{selectedPanel?.customerName || 'Not available'}</p></div>
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order Date</p><p className="mt-1 font-semibold text-slate-800">{formatDateTime(selectedOrderDate)}</p></div>
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Panel Type</p><p className="mt-1 font-semibold text-slate-800">{selectedPanel?.panelType || 'Not available'}</p></div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800"><Clock3 className="h-4 w-4" /> Last Updated</div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{formatDateTime(selectedLastUpdate)}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedLastUpdate?.process || 'No process update recorded'}</p>
              </div>
            </div>
        )}
      </section>

      <ProductionStatusChart data={productionStatusData} completedPercentage={completedPercentage} />
      </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">Production Process</h2>
        {!selectedOrder ? (
          <div className="py-10 text-center text-sm text-slate-500">No production data available.</div>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="grid min-w-[900px] grid-cols-6 gap-3">
                {selectedStages.map(({ stage, update }, index) => {
                  const cardStatus = getProcessCardStatus(
                    stage,
                    index,
                    selectedOrder.currentProcess,
                    update,
                  );
                  const isCurrent = cardStatus === 'Current Process';
                  const isCompleted = cardStatus === 'Completed';
                  const currentIndex = selectedOrder.currentProcess
                    ? PRODUCTION_STAGES.indexOf(selectedOrder.currentProcess)
                    : -1;
                  const connectorClass = (currentIndex > index || (currentIndex === index && isCompleted)) && isCompleted
                    ? 'bg-emerald-400'
                    : currentIndex === index
                      ? 'bg-blue-400'
                      : 'bg-slate-200';

                  return (
                    <div key={stage} className="relative min-w-0 text-center">
                      {index < selectedStages.length - 1 && <div className={`absolute left-1/2 right-[-12px] top-6 h-0.5 ${connectorClass}`} />}
                      <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white shadow-md">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-500 text-white ring-4 ring-blue-100'
                            : isCompleted
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : isCurrent ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : <Clock3 className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                      <div className={`mx-1 mt-3 min-h-[112px] rounded-xl border px-2 py-3 ${
                        isCurrent ? 'border-blue-200 bg-blue-50/80 shadow-sm' : isCompleted ? 'border-emerald-100 bg-emerald-50/60 shadow-sm' : 'border-dashed border-slate-200 bg-slate-50/80'
                      }`}>
                        <p className="min-h-8 break-words text-xs font-semibold leading-4 text-slate-700">{stage}</p>
                        <p className="mt-2 min-h-8 break-words text-[11px] leading-4 text-slate-500">{isCompleted || isCurrent ? formatDateTime(update) : expectedDateLabel()}</p>
                        <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {cardStatus}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-500 bg-emerald-50/60 p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="text-sm font-semibold">Completed Processes</h3>
                </div>
                <div className="mt-3 divide-y divide-emerald-100/80">
                  {selectedStages.filter(({ stage, update }, index) => getProcessCardStatus(stage, index, selectedOrder.currentProcess, update) === 'Completed').map(({ stage, update }) => <div key={stage} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="flex min-w-0 items-center gap-2 font-medium text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" /><span className="truncate">{stage}</span></span><span className="shrink-0 text-xs text-slate-500">{formatDateTime(update)}</span></div>)}
                  {!selectedStages.some(({ stage, update }, index) => getProcessCardStatus(stage, index, selectedOrder.currentProcess, update) === 'Completed') && <div className="py-4 text-center text-sm text-slate-500">No completed process updates.</div>}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 border-t-4 border-t-blue-500 bg-blue-50/60 p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="h-5 w-5" />
                  <h3 className="text-sm font-semibold">Upcoming Processes</h3>
                </div>
                <div className="mt-3 divide-y divide-blue-100/80">
                  {selectedStages.filter(({ stage, update }, index) => getProcessCardStatus(stage, index, selectedOrder.currentProcess, update) === 'Upcoming').map(({ stage }) => <div key={stage} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="flex min-w-0 items-center gap-2 font-medium text-slate-700"><Timer className="h-4 w-4 shrink-0 text-blue-600" /><span className="truncate">{stage}</span></span><span className="shrink-0 text-xs text-slate-500">{expectedDateLabel()}</span></div>)}
                  {!selectedStages.some(({ stage, update }, index) => getProcessCardStatus(stage, index, selectedOrder.currentProcess, update) === 'Upcoming') && <div className="flex min-h-20 items-center justify-center gap-2 py-4 text-center text-sm text-slate-500"><Info className="h-4 w-4 text-blue-600" /><span>No upcoming process updates</span></div>}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><h2 className="text-xl font-bold text-slate-900">All Production Orders</h2><p className="mt-1 text-sm text-slate-500">Production orders from the current Supabase data</p></div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            <label className="w-full text-sm font-medium text-slate-600 sm:w-52">
              <span className="mb-1.5 block">Select S.O. Number</span>
              <span className="relative block">
                <select
                  value={tableSONumber}
                  onChange={(event) => setTableSONumber(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All S.O. Numbers</option>
                  {orders.map((order) => <option key={order.soNumber} value={order.soNumber}>{order.soNumber}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </span>
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">S.O. Number</th><th className="px-5 py-3 font-semibold">Panel</th><th className="px-5 py-3 font-semibold">Current Process</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Last Updated</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleOrders.map((order) => { const panel = order.updates.find((update) => update.panelName || update.panelType); return <tr key={order.soNumber} className="text-slate-700"><td className="px-5 py-4 font-semibold text-slate-900">{order.soNumber}</td><td className="px-5 py-4">{panel?.panelName || panel?.panelType || 'Not available'}</td><td className="px-5 py-4">{order.currentProcess || 'No production update'}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{order.status}</span></td><td className="px-5 py-4 text-slate-500">{formatDateTime(order.lastUpdated)}</td></tr>; })}
              {!visibleOrders.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">No production orders available.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
