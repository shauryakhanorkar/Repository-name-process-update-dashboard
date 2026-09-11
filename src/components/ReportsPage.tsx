import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Factory,
  FileBarChart2,
  PauseCircle,
  Search,
  Timer,
} from 'lucide-react';
import { PROCESS_OPTIONS } from '../constants/processes';
import { ProjectUpdate } from '../types';

interface ReportsPageProps {
  data: ProjectUpdate[];
}

type ReportStatus = 'Completed' | 'In Production' | 'Delayed' | 'On Hold' | 'Pending';

interface ReportOrder {
  soNumber: string;
  updates: ProjectUpdate[];
  latest: ProjectUpdate | null;
  panel: ProjectUpdate | undefined;
  status: ReportStatus;
  currentProcess: string;
}

function normalizeProcess(process: string): string {
  return process
    .replace(/\s+updates?$/i, '')
    .replace('Assembly & Wiring', 'Assembly and Wiring')
    .trim();
}

function updateTime(update: ProjectUpdate): number {
  const parsed = Date.parse(update.timestamp || update.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function latestUpdate(updates: ProjectUpdate[]): ProjectUpdate | null {
  return updates.reduce<ProjectUpdate | null>(
    (latest, update) => (!latest || updateTime(update) >= updateTime(latest) ? update : latest),
    null,
  );
}

function formatDate(value: number): string {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(update: ProjectUpdate | null): string {
  if (!update) return 'Not available';
  const value = updateTime(update);
  if (!value) return update.timestamp || update.date || 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function reportStatus(updates: ProjectUpdate[]): ReportStatus {
  const status = latestUpdate(updates)?.status?.toLowerCase() || '';
  if (status === 'done' || status === 'completed') return 'Completed';
  if (status.includes('delay')) return 'Delayed';
  if (status === 'on hold') return 'On Hold';
  if (status === 'in progress') return 'In Production';
  return 'Pending';
}

function statusClasses(status: ReportStatus): string {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (status === 'In Production') return 'bg-cyan-50 text-cyan-700 ring-cyan-100';
  if (status === 'Delayed') return 'bg-red-50 text-red-700 ring-red-100';
  if (status === 'On Hold') return 'bg-amber-50 text-amber-700 ring-amber-100';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses(status)}`}>
      {status}
    </span>
  );
}

function ExecutiveKpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Factory;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs font-medium text-slate-400">{detail}</p></div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

export default function ReportsPage({ data }: ReportsPageProps) {
  const [dateRange, setDateRange] = useState('All time');
  const [selectedSO, setSelectedSO] = useState('All');
  const [selectedPanel, setSelectedPanel] = useState('All');
  const [selectedProcess, setSelectedProcess] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const orders = useMemo(() => {
    const grouped = new Map<string, ProjectUpdate[]>();
    data.forEach((update) => {
      const soNumber = update.soNumber.trim();
      if (!soNumber) return;
      grouped.set(soNumber, [...(grouped.get(soNumber) || []), update]);
    });
    return Array.from(grouped, ([soNumber, updates]) => ({ soNumber, updates }));
  }, [data]);

  const options = useMemo(() => ({
    soNumbers: orders
      .map(({ soNumber }) => soNumber)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
    panels: Array.from(new Set(
      data.flatMap((item) => [item.panelName, item.panelType, item.otherPanelTypes]).filter(Boolean),
    )).sort(),
    processes: Array.from(new Set(data.map((item) => normalizeProcess(item.process)).filter(Boolean)))
      .sort((left, right) => {
        const leftIndex = PROCESS_OPTIONS.indexOf(left as (typeof PROCESS_OPTIONS)[number]);
        const rightIndex = PROCESS_OPTIONS.indexOf(right as (typeof PROCESS_OPTIONS)[number]);
        return (leftIndex < 0 ? PROCESS_OPTIONS.length : leftIndex) - (rightIndex < 0 ? PROCESS_OPTIONS.length : rightIndex)
          || left.localeCompare(right);
      }),
    statuses: ['Completed', 'In Production', 'Delayed', 'On Hold', 'Pending'],
  }), [data, orders]);

  const filteredUpdates = useMemo(() => {
    const now = Date.now();
    const rangeStart = dateRange === 'Last 7 days'
      ? now - 7 * 86400000
      : dateRange === 'Last 30 days'
        ? now - 30 * 86400000
        : dateRange === 'This year'
          ? new Date(new Date().getFullYear(), 0, 1).getTime()
          : 0;

    return data.filter((update) => {
      const process = normalizeProcess(update.process);
      const time = updateTime(update);
      return (!rangeStart || (time >= rangeStart && time <= now))
        && (selectedSO === 'All' || update.soNumber === selectedSO)
        && (selectedPanel === 'All'
          || update.panelName === selectedPanel
          || update.panelType === selectedPanel
          || update.otherPanelTypes === selectedPanel)
        && (selectedProcess === 'All' || process === selectedProcess)
        && (selectedStatus === 'All' || reportStatus([update]) === selectedStatus);
    });
  }, [data, dateRange, selectedPanel, selectedProcess, selectedSO, selectedStatus]);

  const orderRows = useMemo<ReportOrder[]>(() => {
    return orders
      .map((order) => {
        const updates = filteredUpdates.filter((update) => update.soNumber === order.soNumber);
        const latest = latestUpdate(updates);
        return {
          ...order,
          updates,
          latest,
          panel: updates.find((update) => update.panelName || update.panelType),
          status: reportStatus(updates),
          currentProcess: normalizeProcess(latest?.process || '') || 'Not available',
        };
      })
      .filter((order) => order.updates.length > 0);
  }, [filteredUpdates, orders]);

  const kpis = useMemo(() => ({
    total: orderRows.length,
    completed: orderRows.filter((row) => row.status === 'Completed').length,
    inProduction: orderRows.filter((row) => row.status === 'In Production').length,
    delayed: orderRows.filter((row) => row.status === 'Delayed').length,
    onHold: orderRows.filter((row) => row.status === 'On Hold').length,
  }), [orderRows]);

  const processPerformance = useMemo(() => PROCESS_OPTIONS.map((stage) => {
    const relevantOrders = orderRows.filter((order) => order.updates.some((update) => normalizeProcess(update.process) === stage));
    const completed = relevantOrders.filter((order) => {
      const stageUpdate = latestUpdate(order.updates.filter((update) => normalizeProcess(update.process) === stage));
      return stageUpdate?.status === 'Done' || stageUpdate?.status === 'Completed';
    }).length;
    return {
      stage,
      percentage: relevantOrders.length ? Math.round((completed / relevantOrders.length) * 100) : 0,
      count: relevantOrders.length,
    };
  }), [orderRows]);

  const insights = useMemo(() => {
    const durations = orderRows.map((row) => {
      const times = row.updates.map(updateTime).filter(Boolean);
      return times.length > 1 ? (Math.max(...times) - Math.min(...times)) / 86400000 : null;
    }).filter((value): value is number => value !== null);
    const delayedProcesses = new Map<string, { count: number; latestDelay: number }>();
    filteredUpdates
      .filter((update) => reportStatus([update]) === 'Delayed')
      .forEach((update) => {
        const process = normalizeProcess(update.process) || 'Unknown';
        const current = delayedProcesses.get(process) || { count: 0, latestDelay: 0 };
        current.count += 1;
        current.latestDelay = Math.max(current.latestDelay, updateTime(update));
        delayedProcesses.set(process, current);
      });
    const mostDelayed = Array.from(delayedProcesses.entries())
      .sort((left, right) => right[1].count - left[1].count || right[1].latestDelay - left[1].latestDelay)[0];
    const completedDispatches = orderRows.filter((row) => {
      const dispatch = latestUpdate(row.updates.filter((update) => normalizeProcess(update.process) === 'Dispatch'));
      return dispatch?.status === 'Done' || dispatch?.status === 'Completed';
    }).length;
    return {
      average: durations.length
        ? `${(durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(1)} days`
        : 'Not available',
      mostDelayed,
      completedDispatches,
      onTimeDispatch: 0,
      dispatchSubtitle: completedDispatches ? 'Expected dispatch dates unavailable' : 'No completed dispatches',
    };
  }, [filteredUpdates, orderRows]);

  const percentage = (value: number) => (kpis.total ? Math.round((value / kpis.total) * 100) : 0);

  const filterSelect = (
    label: string,
    value: string,
    setter: (value: string) => void,
    values: string[],
  ) => (
    <label className="relative min-w-0 text-xs font-semibold text-slate-500">
      <span className="mb-1.5 block">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => setter(event.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {values.map((option) => (
            <option key={option} value={option}>{option === 'All' ? `All ${label}s` : option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            <FileBarChart2 className="h-4 w-4" /> Analytics workspace
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Production performance, delays and historical insights</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-5">
          {filterSelect('Date Range', dateRange, setDateRange, ['All time', 'Last 7 days', 'Last 30 days', 'This year'])}
          {filterSelect('S.O. Number', selectedSO, setSelectedSO, ['All', ...options.soNumbers])}
          {filterSelect('Panel', selectedPanel, setSelectedPanel, ['All', ...options.panels])}
          {filterSelect('Process', selectedProcess, setSelectedProcess, ['All', ...options.processes])}
          {filterSelect('Status', selectedStatus, setSelectedStatus, ['All', ...options.statuses])}
        </div>
      </section>

      {!orderRows.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No report data available for the selected filters.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ExecutiveKpiCard label="Total S.O." value={kpis.total} detail="Filtered sales orders" icon={FileBarChart2} tone="bg-blue-50 text-blue-600" />
        <ExecutiveKpiCard label="Completed" value={kpis.completed} detail={`${percentage(kpis.completed)}% completed`} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <ExecutiveKpiCard label="In Production" value={kpis.inProduction} detail={`${percentage(kpis.inProduction)}% in production`} icon={Factory} tone="bg-cyan-50 text-cyan-600" />
        <ExecutiveKpiCard label="Delayed" value={kpis.delayed} detail={`${percentage(kpis.delayed)}% delayed`} icon={AlertTriangle} tone="bg-red-50 text-red-600" />
        <ExecutiveKpiCard label="On Hold" value={kpis.onHold} detail={`${percentage(kpis.onHold)}% on hold`} icon={PauseCircle} tone="bg-amber-50 text-amber-600" />
      </section>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Production Overview</h2>
              <p className="mt-1 text-sm text-slate-500">Status distribution across filtered sales orders</p>
            </div>
            <FileBarChart2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-6 space-y-5">
            {[
              { label: 'Completed', value: kpis.completed, color: 'bg-emerald-500' },
              { label: 'In Production', value: kpis.inProduction, color: 'bg-cyan-500' },
              { label: 'Delayed / On Hold', value: kpis.delayed + kpis.onHold, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-800">{percentage(item.value)}% <span className="font-normal text-slate-400">({item.value})</span></span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentage(item.value)}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">{kpis.completed} of {kpis.total} sales orders are completed.</p>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Process Performance</h2>
              <p className="mt-1 text-sm text-slate-500">Completion rate and management status by process</p>
            </div>
            <Factory className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-5 space-y-3">
            {processPerformance.map(({ stage, percentage, count }) => (
              <div key={stage} className="grid grid-cols-[minmax(0,1fr)_56px_112px] items-center gap-3 text-sm">
                <span className="truncate font-semibold text-slate-700">{stage}</span>
                <span className="text-right text-xs font-bold text-slate-500">{count ? `${percentage}%` : 'N/A'}</span>
                <span className={`rounded-full px-2 py-1 text-center text-[11px] font-semibold ${!count ? 'bg-slate-100 text-slate-500' : percentage >= 80 ? 'bg-emerald-50 text-emerald-700' : percentage >= 50 ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700'}`}>
                  {!count ? 'Pending' : percentage >= 80 ? 'On Track' : percentage >= 50 ? 'In Progress' : 'Needs Attention'}
                </span>
                <div className="col-span-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-cyan-500' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Delay &amp; Performance Summary</h2>
            <p className="mt-1 text-sm text-slate-500">Production orders requiring attention</p>
          </div>
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>{['S.O. Number', 'Customer', 'Panel', 'Current Process', 'Production Days', 'Expected Dispatch', 'Status', 'Action'].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderRows.map((row) => {
                const times = row.updates.map(updateTime).filter(Boolean);
                const productionDays = times.length > 1
                  ? `${Math.max(1, Math.round((Math.max(...times) - Math.min(...times)) / 86400000))} days`
                  : 'N/A';
                const dispatchUpdate = latestUpdate(row.updates.filter((update) => normalizeProcess(update.process) === 'Dispatch'));
                return (
                  <tr key={row.soNumber} className={`transition hover:bg-slate-50/70 ${row.status === 'Delayed' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-5 py-4 font-bold text-slate-900">{row.soNumber}</td>
                    <td className="px-5 py-4">{row.panel?.customerName || 'Not available'}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{row.panel?.panelName || row.panel?.panelType || 'Not available'}</td>
                    <td className="px-5 py-4">{row.currentProcess}</td>
                    <td className="px-5 py-4 text-slate-500">{productionDays}</td>
                    <td className="px-5 py-4 text-slate-500">{dispatchUpdate ? formatDateTime(dispatchUpdate) : 'Not scheduled'}</td>
                    <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-5 py-4"><button type="button" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50">View</button></td>
                  </tr>
                );
              })}
              {!orderRows.length && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No report data available for the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Timer className="h-4 w-4 text-blue-500" /> Average Production Time</div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{insights.average}</p>
          <p className="mt-1 text-xs text-slate-400">Based on available update timestamps</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays className="h-4 w-4 text-emerald-500" /> On-Time Dispatch</div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{insights.onTimeDispatch}%</p>
          <p className="mt-1 text-xs text-slate-400">{insights.dispatchSubtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><AlertTriangle className="h-4 w-4 text-amber-500" /> Most Delayed Process</div>
          <p className="mt-3 truncate text-2xl font-bold text-slate-900">{insights.mostDelayed?.[0] || 'No delays'}</p>
          <p className="mt-1 text-xs text-slate-400">{insights.mostDelayed ? `${insights.mostDelayed[1].count} delayed updates in this view` : 'All tracked processes are on schedule'}</p>
        </div>
      </section>
    </div>
  );
}
