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

  /* =========================================================
     PROCESS SUMMARY
     ========================================================= */

  const processSummary = useMemo(() => {
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
        displayName:
          PROCESS_SHORT_NAMES[process],
        done,
        inProgress,
        pending,
        total,
        completion,
      };
    });

  }, [data]);


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-6 flex items-center gap-3">

        <div className="h-7 w-1 rounded-full bg-indigo-600" />

        <h2 className="text-lg font-bold text-slate-900">
          Process Summary
        </h2>

      </div>


      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="overflow-x-auto">

        <table className="w-full min-w-[720px] border-collapse">

          <thead>

            <tr className="bg-[#0c1b3d] text-white">

              <th className="rounded-tl-lg px-4 py-4 text-left text-sm font-semibold">
                Process
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold">
                Done
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold">
                In Progress
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold">
                Pending
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold">
                Total
              </th>

              <th className="rounded-tr-lg px-4 py-4 text-center text-sm font-semibold">
                Completion
              </th>

            </tr>

          </thead>


          <tbody>

            {processSummary.map((item) => (

              <tr
                key={item.process}
                className="border-b border-slate-100 last:border-b-0"
              >

                <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                  {item.displayName}
                </td>


                <td className="px-4 py-4 text-center text-sm text-slate-700">
                  {item.done}
                </td>


                <td className="px-4 py-4 text-center text-sm text-slate-700">
                  {item.inProgress}
                </td>


                <td className="px-4 py-4 text-center text-sm text-slate-700">
                  {item.pending}
                </td>


                <td className="px-4 py-4 text-center text-sm font-semibold text-slate-800">
                  {item.total}
                </td>


                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.completion.toFixed(1)}%
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>  
  );
}