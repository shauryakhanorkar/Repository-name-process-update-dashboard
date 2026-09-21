import React, { useMemo } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { ProjectUpdate } from '../types';
import { businessDateKey, isActualSubmittedUpdate } from '../lib/projectDates';

interface ProcessChartProps {
  data: ProjectUpdate[];
  onSelectOrder: (soNumber: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function updateTimestamp(update: ProjectUpdate): number {
  const parsed = Date.parse(update.timestamp || update.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareUpdates(left: ProjectUpdate, right: ProjectUpdate): number {
  const timestampDifference = updateTimestamp(left) - updateTimestamp(right);
  if (timestampDifference !== 0) return timestampDifference;
  return (left.processOrder || 0) - (right.processOrder || 0);
}

function isRealSubmittedUpdate(update: ProjectUpdate): boolean {
  if (!isActualSubmittedUpdate(update)) return false;

  return update.formName?.trim().toLowerCase() !== 'auto-marked (prior stage)';
}

function isCompletedStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'done' || normalizedStatus === 'completed';
}

function isInProgressStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'in progress' || normalizedStatus === 'in-progress' || normalizedStatus === 'inprogress';
}

function getProjectHealth(updates: ProjectUpdate[]): 'HEALTHY' | 'AT RISK' | 'ATTENTION' | 'NO UPDATES' {
  const latestUpdate = [...updates]
    .filter(isRealSubmittedUpdate)
    .sort((left, right) => compareUpdates(right, left))[0];

  if (!latestUpdate) return 'NO UPDATES';
  if (latestUpdate.status.trim().toLowerCase() === 'pending') return 'AT RISK';
  if (isCompletedStatus(latestUpdate.status)) return 'HEALTHY';
  if (isInProgressStatus(latestUpdate.status)) return 'ATTENTION';
  return 'ATTENTION';
}

function formatUpdateTime(update: ProjectUpdate): string {
  const parsed = new Date(update.timestamp || update.date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProcessChart({ data, onSelectOrder, selectedDate, onDateChange }: ProcessChartProps) {
  const todayDate = localDateKey(new Date());
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const isTodaySelected = selectedDate === todayDate;

  const selectedDateUpdates = useMemo(() => {
    const latestByOrder = new Map<string, ProjectUpdate>();

    data
    .filter((update) => isRealSubmittedUpdate(update) && businessDateKey(update) === selectedDate && update.process.trim())
      .forEach((update) => {
        const soNumber = update.soNumber.trim();
        if (!soNumber) return;
        const current = latestByOrder.get(soNumber);
        if (!current || compareUpdates(update, current) >= 0) {
          latestByOrder.set(soNumber, update);
        }
      });

    return Array.from(latestByOrder.values()).sort(
      (left, right) => compareUpdates(right, left),
    );
  }, [data, selectedDate]);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded bg-[#4f46e5]" />
            <h2 className="font-sans text-base font-bold text-slate-800">Today's Production Status</h2>
          </div>
          <p className="mt-1 pl-3 text-xs text-slate-400">
            {isTodaySelected ? "Live view of today's production updates" : 'Live view of production updates for the selected date'}
          </p>
        </div>
        <label className="flex items-center gap-1.5 pl-3 text-xs font-medium text-slate-500 sm:pl-0">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center">{selectedDateLabel}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              aria-label="Select production update date"
              className="w-[124px] cursor-pointer rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-1 text-transparent outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </span>
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              {['S.O. Number', 'Panel', 'Current Process', 'Status', 'Latest Update', 'Note'].map((heading) => (
                <th key={heading} className="px-3 pb-3 font-semibold first:pl-0 last:pr-0">{heading}</th>
              ))}
              <th className="px-3 pb-3 font-semibold">Health</th>
              <th className="px-3 pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedDateUpdates.map((update) => (
              <tr
                key={`${update.soNumber}-${update.timestamp}`}
                onClick={() => onSelectOrder(update.soNumber)}
                className="cursor-pointer text-slate-700 transition hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-3 py-3.5 pl-0 font-semibold text-slate-900">{update.soNumber || 'N/A'}</td>
                <td className="px-3 py-3.5">{update.panelName || update.panelType || update.otherPanelTypes || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{update.process || 'N/A'}</td>
                <td className="px-3 py-3.5"><span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{update.status || 'N/A'}</span></td>
                <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">{isTodaySelected ? 'Today, ' : ''}{formatUpdateTime(update)}</td>
                <td className="max-w-[220px] truncate px-3 py-3.5 text-slate-500">{update.note_remarks || 'N/A'}</td>
                <td className="px-3 py-3.5">
                  {(() => {
                    const health = getProjectHealth(
                      data.filter((item) => item.soNumber.trim() === update.soNumber.trim() && businessDateKey(item) === selectedDate)
                    );
                    const healthClassName = health === 'HEALTHY'
                      ? 'bg-emerald-50 text-emerald-700'
                      : health === 'AT RISK'
                        ? 'bg-red-50 text-red-700'
                        : health === 'ATTENTION'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500';

                    return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${healthClassName}`}>{health}</span>;
                  })()}
                </td>
                <td className="px-3 py-3.5 pr-0 text-right"><ArrowRight className="ml-auto h-4 w-4 text-slate-400" /></td>
              </tr>
            ))}
            {!selectedDateUpdates.length && (
              <tr><td colSpan={8} className="px-0 py-10 text-center text-sm text-slate-500">No production updates recorded on this date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}