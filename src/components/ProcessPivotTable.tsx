import React, { useMemo } from 'react';
import { ProjectUpdate } from '../types';

interface ProcessPivotTableProps {
  data: ProjectUpdate[];
}

const PROCESSES = [
  'Quotation',
  'Fabrication',
  'Powder Coating',
  'Assembly and Wiring',
  'Testing',
  'Dispatch',
];

const PROCESS_SHORT_NAMES: Record<string, string> = {
  'Quotation': 'Quotation',
  'Fabrication': 'Fabrication',
  'Powder Coating': 'Powder Coating',
  'Assembly and Wiring': 'Assembly & Wiring',
  'Testing': 'Testing',
  'Dispatch': 'Dispatch',
};

export default function ProcessPivotTable({
  data,
}: ProcessPivotTableProps) {
  const processCompletion = useMemo(() => {
    return PROCESSES.map((process) => {
      const processItems = data.filter(
        (item) => item.process === process
      );

      const done = processItems.filter(
        (item) => item.status === 'Done'
      ).length;

      const inProgress = processItems.filter(
        (item) => item.status === 'In Progress'
      ).length;

      const pending = processItems.filter(
        (item) => item.status === 'Pending'
      ).length;

      const total = done + inProgress + pending;

      const completion =
        total > 0
          ? (done / total) * 100
          : 0;

      return {
        process,
        displayName: PROCESS_SHORT_NAMES[process],
        completion,
      };
    });

  }, [data]);

  const lowestCompletion = processCompletion.reduce(
    (lowest, item) =>
      !lowest || item.completion < lowest.completion
        ? item
        : lowest,
    undefined as (typeof processCompletion)[number] | undefined
  );


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-indigo-600" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Process Completion
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Completion rate across production stages
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {processCompletion.map((item) => {
          const isLowest = item.process === lowestCompletion?.process;

          return (
            <div
              key={item.process}
              className={`rounded-xl px-3 py-2 transition-colors ${
                isLowest
                  ? 'bg-amber-50/70 ring-1 ring-amber-100'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                  {item.displayName}
                </span>
                <span className={`shrink-0 text-sm font-bold ${
                  isLowest ? 'text-amber-700' : 'text-emerald-600'
                }`}>
                  {item.completion.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    isLowest
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${item.completion}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}