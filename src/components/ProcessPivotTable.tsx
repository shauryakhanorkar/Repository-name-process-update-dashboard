import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { ProjectUpdate } from '../types';
import { businessDateKey, isActualSubmittedUpdate } from '../lib/projectDates';

interface ProcessPivotTableProps {
  data: ProjectUpdate[];
  allData: ProjectUpdate[];
  selectedDate: string;
  onSelectOrder: (soNumber: string) => void;
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

interface CustomerProgress {
  rowKey: string;
  customerName: string;
  soNumber: string;
  panel: string;
  currentProcess: string;
  status: string;
  processUpdates: Record<string, ProjectUpdate>;
  latestUpdate: ProjectUpdate;
  latestTimestamp: string;
}

function getTimestampValue(update: ProjectUpdate) {
  const value = Date.parse(update.timestamp || update.date);
  return Number.isNaN(value) ? 0 : value;
}

function getProjectKey(update: ProjectUpdate): string {
  const soNumber = update.soNumber.trim();
  return soNumber || update.panelName.trim();
}

function isCompletedStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'done' || normalizedStatus === 'completed';
}

function isInProgressStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'in progress' || normalizedStatus === 'in-progress' || normalizedStatus === 'inprogress';
}

export default function ProcessPivotTable({
  data,
  allData,
  selectedDate,
  onSelectOrder,
}: ProcessPivotTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('All Customers');

  const customerOptions = useMemo(() => Array.from(
    new Set(data.map((item) => item.customerName.trim()).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right)), [data]);

  const selectedDateUpdates = useMemo(() => data.filter(
    (item) => isActualSubmittedUpdate(item) && businessDateKey(item) === selectedDate &&
      (selectedCustomer === 'All Customers' || item.customerName.trim() === selectedCustomer)
  ), [data, selectedCustomer, selectedDate]);

  const customerProgress = useMemo<CustomerProgress[]>(() => {
    const selectedProjects = new Map<string, ProjectUpdate>();

    selectedDateUpdates.forEach((item) => {
      if (!PROCESSES.includes(item.process)) return;
      const projectKey = getProjectKey(item);
      const current = selectedProjects.get(projectKey);
      if (!current || getTimestampValue(item) > getTimestampValue(current) || (
        getTimestampValue(item) === getTimestampValue(current) &&
        (item.processOrder ?? 0) > (current.processOrder ?? 0)
      )) {
        selectedProjects.set(projectKey, item);
      }
    });

    return Array.from(selectedProjects.entries())
      .map(([rowKey, selectedProject]) => {
        const updates = allData.filter((item) =>
          isActualSubmittedUpdate(item) &&
          getProjectKey(item) === rowKey &&
          businessDateKey(item) === selectedDate &&
          PROCESSES.includes(item.process)
        );
        const sortedUpdates = [...updates].sort((left, right) => {
          const timestampDifference = getTimestampValue(right) - getTimestampValue(left);

          if (timestampDifference !== 0) return timestampDifference;

          return (right.processOrder ?? 0) - (left.processOrder ?? 0);
        });

        const latestUpdate = sortedUpdates[0];
        const processUpdates = updates.reduce<Record<string, ProjectUpdate>>((latestByProcess, update) => {
          const current = latestByProcess[update.process];
          if (!current || getTimestampValue(update) > getTimestampValue(current) || (
            getTimestampValue(update) === getTimestampValue(current) &&
            (update.processOrder ?? 0) > (current.processOrder ?? 0)
          )) {
            latestByProcess[update.process] = update;
          }
          return latestByProcess;
        }, {});

        return {
          rowKey,
          customerName: selectedProject.customerName.trim() || 'Customer not available',
          soNumber: selectedProject.soNumber.trim(),
          panel: latestUpdate.panelName.trim() || latestUpdate.panelType.trim() || latestUpdate.otherPanelTypes.trim(),
          currentProcess: latestUpdate.process,
          status: latestUpdate.status,
          processUpdates,
          latestUpdate,
          latestTimestamp: latestUpdate.timestamp || latestUpdate.date,
        };
      })
      .sort((left, right) => {
        const customerDifference = left.customerName.localeCompare(right.customerName);
        return customerDifference || left.soNumber.localeCompare(right.soNumber);
      });
  }, [allData, selectedDateUpdates]);

  const emptyMessage = selectedCustomer === 'All Customers'
    ? 'No production updates recorded for this date.'
    : 'No production updates found for this customer on this date.';


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-indigo-600" />
          <div>
          <h2 className="text-lg font-bold text-slate-900">
            Today's Production Progress
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Track each customer's current production stage
          </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Customer</span>
            <select
              value={selectedCustomer}
              onChange={(event) => setSelectedCustomer(event.target.value)}
              className="h-9 max-w-[170px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              aria-label="Filter production progress by customer"
            >
              <option>All Customers</option>
              {customerOptions.map((customer) => <option key={customer}>{customer}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[minmax(220px,1.1fr)_minmax(840px,3fr)] border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <div className="px-3">Customer / Project</div>
            <div className="grid grid-cols-6">
              {PROCESSES.map((process) => (
                <div key={process} className="px-2 text-center">
                  {PROCESS_SHORT_NAMES[process]}
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {customerProgress.map((customer) => {
              const currentIndex = PROCESSES.indexOf(customer.currentProcess);
              const tooltip = [
                `Customer Name: ${customer.customerName}`,
                `S.O. Number: ${customer.soNumber || 'Not available'}`,
                `Panel: ${customer.panel || 'Not available'}`,
                `Current Process: ${PROCESS_SHORT_NAMES[customer.currentProcess]}`,
                `Status: ${customer.status || 'Not available'}`,
                `Latest Update: ${customer.latestTimestamp || 'Not available'}`,
              ].join('\n');

              return (
                <div
                  key={customer.rowKey}
                  title={tooltip}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectOrder(customer.soNumber)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectOrder(customer.soNumber);
                    }
                  }}
                  className="grid cursor-pointer grid-cols-[minmax(220px,1.1fr)_minmax(840px,3fr)] items-center py-4 text-sm outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  <div className="min-w-0 px-3">
                    <div className="truncate font-semibold text-slate-700">{customer.customerName}</div>
                    <div className="mt-1 truncate text-xs text-slate-500">S.O. {customer.soNumber || 'Not available'}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">{customer.panel || 'Panel not available'}</div>
                  </div>
                  <div className="px-2">
                    <div className="grid min-h-[72px] grid-cols-6 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      {PROCESSES.map((process, index) => {
                        const processUpdate = customer.processUpdates[process];
                        const latestProcessIsCompleted = isCompletedStatus(customer.status);
                        const latestProcessIsInProgress = isInProgressStatus(customer.status);
                        const isBeforeCurrent = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isCompleted = isBeforeCurrent || (isCurrent && latestProcessIsCompleted);
                        const isInProgress = isCurrent && latestProcessIsInProgress;
                        const statusLabel = isCompleted
                          ? 'DONE'
                          : isInProgress
                            ? 'IN PROGRESS'
                            : isCurrent
                              ? 'CURRENT'
                              : 'UPCOMING';

                        return (
                          <div
                            key={process}
                            className={`flex min-w-0 flex-col justify-center border-r border-white/70 px-2 py-1.5 last:border-r-0 ${isCompleted ? 'bg-emerald-500 text-white' : isInProgress ? 'bg-amber-400 text-amber-950' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                          >
                            <div className="flex items-center gap-1 text-[10px] font-bold leading-tight">
                              {isCompleted && <Check className="h-3 w-3 shrink-0" />}
                              <span className="truncate">{statusLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {customerProgress.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="text-blue-600">✓ Completed</span>
        <span className="text-amber-500">● Current Process</span>
        <span className="text-slate-400">○ Upcoming</span>
      </div>
    </div>
  );
}