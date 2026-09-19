import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Layers3,
  LoaderCircle,
} from 'lucide-react';
import { ProjectUpdate } from '../types';
import { isActualSubmittedUpdate } from '../lib/projectDates';

interface PanelPivotTableProps {
  data: ProjectUpdate[];
}

function updateTimestamp(update: ProjectUpdate): number {
  const parsed = Date.parse(update.timestamp || update.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isCompletedStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'done' || normalizedStatus === 'completed';
}

function isInProgressStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'in progress' || normalizedStatus === 'in-progress' || normalizedStatus === 'inprogress';
}

export default function PanelPivotTable({ data }: PanelPivotTableProps) {
  const latestProjectUpdates = useMemo(() => {
    const latestByProject = new Map<string, ProjectUpdate>();

    data.filter(isActualSubmittedUpdate).forEach((update) => {
      const soNumber = update.soNumber.trim();
      if (!soNumber) return;

      const current = latestByProject.get(soNumber);
      if (!current || updateTimestamp(update) > updateTimestamp(current) || (
        updateTimestamp(update) === updateTimestamp(current) &&
        (update.processOrder ?? 0) > (current.processOrder ?? 0)
      )) {
        latestByProject.set(soNumber, update);
      }
    });

    return Array.from(latestByProject.values());
  }, [data]);

  const panelSummary = useMemo(() => {
    const panelTypes = Array.from(
      new Set(latestProjectUpdates.map((item) => item.panelType))
    ).filter(
      (panelType): panelType is string =>
        Boolean(panelType?.trim()) &&
        panelType.trim().toUpperCase() !== 'N/A'
    );

    return panelTypes.map((panelType) => {
      const panelProjects = latestProjectUpdates.filter(
        (item) => item.panelType === panelType
      );
      const pending = panelProjects.filter(
        (item) => !isCompletedStatus(item.status) && !isInProgressStatus(item.status)
      ).length;
      const inProgress = panelProjects.filter(
        (item) => isInProgressStatus(item.status)
      ).length;
      const done = panelProjects.filter(
        (item) => isCompletedStatus(item.status)
      ).length;

      return {
        panelType,
        pending,
        inProgress,
        done,
        total: pending + inProgress + done,
      };
    }).map((panel) => ({
      ...panel,
      completion: panel.total > 0
        ? (panel.done / panel.total) * 100
        : 0,
    })).sort((left, right) =>
      left.completion - right.completion ||
      right.pending - left.pending
    );
  }, [latestProjectUpdates]);

  const totalPanels = latestProjectUpdates.length;
  const totalCompleted = latestProjectUpdates.filter(
    (update) => isCompletedStatus(update.status)
  ).length;
  const totalPending = latestProjectUpdates.filter(
    (update) => !isCompletedStatus(update.status) && !isInProgressStatus(update.status)
  ).length;
  const totalInProgress = latestProjectUpdates.filter(
    (update) => isInProgressStatus(update.status)
  ).length;
  const highestPendingPanel = panelSummary.reduce(
    (highest, panel) =>
      !highest || panel.pending > highest.pending
        ? panel
        : highest,
    undefined as (typeof panelSummary)[number] | undefined
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded bg-[#4f46e5]" />
          <h2 className="font-sans text-base font-bold text-slate-800">
            Panel wise Pivot Table
          </h2>
        </div>
        <p className="mt-1 pl-3 text-xs text-slate-400">
          Panel production status at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 border-b border-slate-50 px-5 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50/60 px-3 py-2">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
            <Layers3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              Total Panels
            </p>
            <p className="mt-0.5 text-xl font-bold leading-none text-slate-800">
              {totalPanels}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 bg-emerald-50/60 px-3 py-2">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Completed
            </p>
            <p className="mt-0.5 text-xl font-bold leading-none text-slate-800">
              {totalCompleted}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 border-l-4 border-l-amber-500 bg-amber-50/70 px-3 py-2">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Total Pending
            </p>
            <p className="mt-0.5 text-xl font-bold leading-none text-amber-800">
              {totalPending}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-purple-100 border-l-4 border-l-purple-500 bg-purple-50/60 px-3 py-2">
          <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
            <LoaderCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-700">
              In Progress
            </p>
            <p className="mt-0.5 text-xl font-bold leading-none text-slate-800">
              {totalInProgress}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="bg-[#0c1b3d] text-white">
              <th className="px-4 py-2.5 text-left text-xs font-bold tracking-wider">
                Panel Type
              </th>
              <th className="bg-[#172b52] px-4 py-2.5 text-center text-xs font-bold tracking-wider">
                Total
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-bold tracking-wider">
                Completed
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-bold tracking-wider">
                In Progress
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-bold tracking-wider">
                Pending
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-bold tracking-wider">
                Completion %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {panelSummary.map((panel) => (
              <tr key={panel.panelType} className="transition-colors duration-150 hover:bg-slate-50/80">
                <td className="px-4 py-2.5 font-semibold text-slate-700">
                  {panel.panelType}
                </td>
                <td className="bg-slate-50/80 px-4 py-2.5 text-center font-semibold text-slate-800">
                  {panel.total}
                </td>
                <td className="bg-emerald-50/40 px-4 py-2.5 text-center font-medium text-emerald-700">
                  {panel.done || '-'}
                </td>
                <td className="bg-orange-50/40 px-4 py-2.5 text-center font-medium text-orange-700">
                  {panel.inProgress || '-'}
                </td>
                <td className={`px-4 py-2.5 text-center font-medium ${
                  panel.pending > 0
                    ? 'bg-red-50 text-red-700'
                    : 'text-slate-300'
                }`}>
                  {panel.pending || '-'}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex min-w-[125px] items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${panel.completion}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-slate-700">
                      {panel.completion.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
        {highestPendingPanel
          ? `Highest pending: ${highestPendingPanel.panelType} (${highestPendingPanel.pending} pending)`
          : 'No pending panel work currently recorded'}
      </div>
    </div>
  );
}
