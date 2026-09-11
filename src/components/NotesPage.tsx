import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Search,
  TriangleAlert,
} from 'lucide-react';
import { ProjectUpdate } from '../types';

interface NotesPageProps {
  data: ProjectUpdate[];
}

type NotePriority = 'Critical' | 'Important' | 'Normal';

const PAGE_SIZE = 6;

function noteDate(update: ProjectUpdate): Date | null {
  const value = update.timestamp || update.date;
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getNotePriority(noteRemarks: string | null): NotePriority {
  const note = noteRemarks?.trim().toLowerCase() ?? '';

  const criticalIndicators = [
    'critical',
    'emergency',
    'urgent',
    'immediately',
    'major issue',
    'production stopped',
    'production halt',
    'completely stopped',
    'stopped',
    'breakdown',
    'failure',
    'failed',
    'major failure',
    'safety issue',
    'safety risk',
    'accident',
    'dangerous',
    'serious issue',
    'dispatch blocked',
    'shipment blocked',
    'cannot dispatch',
    'customer escalation',
    'deadline missed',
    'severe delay',
    'major delay',
    'payment blocked',
    'approval blocked',
    'work cannot continue',
    'unable to continue',
    'rejected',
    'rejection',
    'failed inspection',
    'quality failure',
  ];

  if (criticalIndicators.some((indicator) => note.includes(indicator))) {
    return 'Critical';
  }

  const importantIndicators = [
    'important',
    'material pending',
    'material delayed',
    'material delivery delayed',
    'supplier pending',
    'supplier has not confirmed',
    'delivery not confirmed',
    'waiting for material',
    'waiting for approval',
    'pending approval',
    'delayed',
    'delay',
    'late',
    'shortage',
    'supplier delay',
    'follow up',
    'requires attention',
    'attention',
    'issue',
    'problem',
    'expected by',
    'schedule affected',
    'documentation pending',
    'inspection pending',
    'customer confirmation pending',
    'waiting for customer confirmation',
    'waiting',
    'required',
    'prepare required',
    'prepare the required',
  ];

  if (importantIndicators.some((indicator) => note.includes(indicator))) {
    return 'Important';
  }

  return 'Normal';
}

function isThisWeek(date: Date | null): boolean {
  if (!date) return false;

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

function isNewNote(date: Date | null): boolean {
  if (!date) return false;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return date >= sevenDaysAgo;
}

function formatDate(date: Date | null): string {
  if (!date) return 'Date unavailable';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date: Date | null): string {
  if (!date) return 'Date unavailable';

  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function priorityClasses(priority: NotePriority): string {
  if (priority === 'Critical') return 'bg-red-50 text-red-700 ring-red-100';
  if (priority === 'Important') return 'bg-amber-50 text-amber-700 ring-amber-100';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function priorityAccentClasses(priority: NotePriority): string {
  if (priority === 'Critical') return 'border-l-red-500';
  if (priority === 'Important') return 'border-l-amber-400';
  return 'border-l-emerald-500';
}

function priorityIcon(priority: NotePriority) {
  if (priority === 'Critical') return <TriangleAlert className="h-3.5 w-3.5" />;
  if (priority === 'Important') return <AlertTriangle className="h-3.5 w-3.5" />;
  return <CheckCircle2 className="h-3.5 w-3.5" />;
}

export default function NotesPage({ data }: NotesPageProps) {
  const [search, setSearch] = useState('');
  const [processFilter, setProcessFilter] = useState('All Processes');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [dateFilter, setDateFilter] = useState('All dates');
  const [page, setPage] = useState(1);

  const notes = useMemo(() => data
    .filter((update) => Boolean(update.note_remarks?.trim()))
    .map((update) => ({
      update,
      date: noteDate(update),
      priority: getNotePriority(update.note_remarks),
      panel: update.panelName || update.panelType || update.otherPanelTypes || 'Panel',
    }))
    .sort((left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0)), [data]);

  const processes = useMemo(() => Array.from(new Set(
    data
      .map((update) => update.process?.trim())
      .filter((process): process is string => Boolean(process))
  )).sort(), [data]);

  const filteredNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return notes.filter(({ update, date, priority, panel }) => {
      const matchesSearch = !normalizedSearch || [update.soNumber, panel, update.note_remarks]
        .some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesProcess = processFilter === 'All Processes' || update.process === processFilter;
      const matchesPriority = priorityFilter === 'All Priorities' || priority === priorityFilter;
      const matchesDate = dateFilter === 'All dates'
        || (dateFilter === 'This week' && isThisWeek(date))
        || (dateFilter === 'Last 30 days' && Boolean(date && date >= thirtyDaysAgo));

      return matchesSearch && matchesProcess && matchesPriority && matchesDate;
    });
  }, [dateFilter, notes, priorityFilter, processFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageNotes = filteredNotes.slice(pageStart, pageStart + PAGE_SIZE);
  const latestNotes = notes.slice(0, 3);

  const summary = {
    total: notes.length,
    newNotes: notes.filter(({ date }) => isNewNote(date)).length,
    critical: notes.filter(({ priority }) => priority === 'Critical').length,
    thisWeek: notes.filter(({ date }) => isThisWeek(date)).length,
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notes</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Important remarks, issues, delays and instructions from production and dispatch teams.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Notes', value: summary.total, icon: FileText, tone: 'text-blue-600 bg-blue-50' },
          { label: 'Unread / New', value: summary.newNotes, icon: Clock3, tone: 'text-violet-600 bg-violet-50' },
          { label: 'Critical Notes', value: summary.critical, icon: AlertTriangle, tone: 'text-red-600 bg-red-50' },
          { label: 'This Week', value: summary.thisWeek, icon: CalendarDays, tone: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="min-h-[120px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Latest Notes</h2>
            <p className="mt-1 text-sm text-slate-500">The most recent production updates and remarks.</p>
          </div>
        </div>

        {latestNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No notes have been added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {latestNotes.map(({ update, date, priority, panel }, index) => (
              <article key={`${update.soNumber}-${update.timestamp}-${index}`} className={`rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${priorityAccentClasses(priority)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">S.O. {update.soNumber || '-'}</p>
                    <h3 className="mt-1 font-bold text-slate-900">{panel}</h3>
                    <p className="mt-1 text-sm text-slate-500">{update.process || 'Process update'}</p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${priorityClasses(priority)}`}>{priorityIcon(priority)}{priority}</span>
                </div>
                <p className="mt-5 min-h-12 text-sm font-medium leading-6 text-slate-800">{update.note_remarks?.trim() || 'No remarks'}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <span>{formatDateTime(date)}</span>
                  {update.employeeName && <span>{update.employeeName}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">All Notes</h2>
          <p className="mt-1 text-sm text-slate-500">Browse every note recorded against a process update.</p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative block xl:col-span-1">
              <span className="sr-only">Search S.O. / Panel / Note</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search S.O. / Panel / Note" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
            <select value={processFilter} onChange={(event) => updateFilter(setProcessFilter, event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>All Processes</option>
              {processes.map((process) => <option key={process}>{process}</option>)}
            </select>
            <select value={priorityFilter} onChange={(event) => updateFilter(setPriorityFilter, event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>All Priorities</option>
              <option>Critical</option>
              <option>Important</option>
              <option>Normal</option>
            </select>
            <select value={dateFilter} onChange={(event) => updateFilter(setDateFilter, event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>All dates</option>
              <option>This week</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">S.O. Number</th>
                <th className="px-5 py-3">Panel</th>
                <th className="px-5 py-3">Process</th>
                <th className="px-5 py-3">Note / Remark</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageNotes.map(({ update, date, priority, panel }, index) => (
                <tr key={`${update.soNumber}-${update.timestamp}-${index}`} className={`border-l-4 text-slate-600 transition hover:bg-slate-50/70 ${priorityAccentClasses(priority)}`}>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{update.soNumber || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">{panel}</td>
                  <td className="whitespace-nowrap px-5 py-4">{update.process || '-'}</td>
                  <td className="max-w-xs px-5 py-4"><p className="truncate font-medium text-slate-700" title={update.note_remarks ?? ''}>{update.note_remarks?.trim() || 'No remarks'}</p></td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${priorityClasses(priority)}`}>{priorityIcon(priority)}{priority}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(date)}</td>
                  <td className="px-5 py-4"><button type="button" aria-label={`View note for S.O. ${update.soNumber || '-'}`} title="View note" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageNotes.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No notes match the selected filters.</div>}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {filteredNotes.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredNotes.length)} of {filteredNotes.length} notes</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-sm font-semibold text-white">{currentPage}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}