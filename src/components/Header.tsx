import React from 'react';
import { FileText, Layers, RefreshCw, ChevronDown } from 'lucide-react';

interface HeaderProps {
  soNumbers: string[];
  panels: string[];
  processes: string[];
  statuses: string[];

  selectedSONumber: string;
  selectedPanel: string;
  selectedProcess: string;
  selectedStatus: string;

  onSONumberChange: (val: string) => void;
  onPanelChange: (val: string) => void;
  onProcessChange: (val: string) => void;
  onStatusChange: (val: string) => void;

  onRefresh: () => void;
}

export default function Header({
  soNumbers,
  panels,
  processes,
  statuses,

  selectedSONumber,
  selectedPanel,
  selectedProcess,
  selectedStatus,

  onSONumberChange,
  onPanelChange,
  onProcessChange,
  onStatusChange,

  onRefresh,
}: HeaderProps) {
  const selectClassName =
    'w-full min-w-0 appearance-none rounded-xl border border-white/10 bg-white/10 py-3 pl-3 pr-9 text-sm font-medium text-white outline-none transition hover:bg-white/[0.14] focus:border-[#38bdf8]/60 focus:ring-2 focus:ring-[#38bdf8]/30 cursor-pointer';

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1e3d] to-[#1a355e] p-5 text-white shadow-xl sm:p-6 lg:p-8">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute right-0 top-0 -mr-24 -mt-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-24 -ml-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Title and Subtitle */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#38bdf8] sm:text-xs">
              Operations · Live Overview
            </span>
          </div>

          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            Process Update Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Real-time tracking across all active projects &amp; panels
          </p>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98] disabled:opacity-50 sm:w-auto lg:mt-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filter Row */}
      <div className="relative mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 sm:gap-4 lg:mt-7 lg:pt-6 xl:grid-cols-4">
        {/* S.O. Number Filter */}
        <div className="relative min-w-0">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <FileText className="h-3.5 w-3.5 text-[#38bdf8]" />
            S.O. Number
          </label>
          <div className="relative">
            <select
              value={selectedSONumber}
              onChange={(e) => onSONumberChange(e.target.value)}
              className={selectClassName}
            >
              <option value="All" className="bg-[#122445] text-white">All S.O. Numbers</option>
              {soNumbers.map((soNumber) => (
                <option key={soNumber} value={soNumber} className="bg-[#122445] text-white">
                  {soNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </div>
        </div>

        {/* Panel Filter */}
        <div className="relative min-w-0">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Layers className="h-3.5 w-3.5 text-[#38bdf8]" />
            Panel
          </label>
          <div className="relative">
            <select
              value={selectedPanel}
              onChange={(e) => onPanelChange(e.target.value)}
              className={selectClassName}
            >
              <option value="All" className="bg-[#122445] text-white">All Panels</option>
              {panels.map((panel) => (
                <option key={panel} value={panel} className="bg-[#122445] text-white">
                  {panel}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </div>
        </div>

        {/* Process Filter */}
        <div className="relative min-w-0">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Layers className="h-3.5 w-3.5 text-[#38bdf8]" />
            Process
          </label>
          <div className="relative">
            <select
              value={selectedProcess}
              onChange={(e) => onProcessChange(e.target.value)}
              className={selectClassName}
            >
              <option value="All" className="bg-[#122445] text-white">All Processes</option>
              {processes.map((process) => (
                <option key={process} value={process} className="bg-[#122445] text-white">
                  {process} Updates
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative min-w-0">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Layers className="h-3.5 w-3.5 text-[#38bdf8]" />
            Status
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className={selectClassName}
            >
              <option value="All" className="bg-[#122445] text-white">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status} className="bg-[#122445] text-white">
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
