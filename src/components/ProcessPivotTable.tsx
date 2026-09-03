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
  'Dispatch'
];

const STATUSES = [
  'Done',
  'Pending',
  'In Progress'
];

export default function ProcessPivotTable({
  data
}: ProcessPivotTableProps) {

  const pivotData = useMemo(() => {

    return PROCESSES.map((process) => {

      const processItems = data.filter(
        (item) => item.process === process
      );

      return {
        process,

        Done: processItems.filter(
          (item) => item.status === 'Done'
        ).length,

        Pending: processItems.filter(
          (item) => item.status === 'Pending'
        ).length,

        'In Progress': processItems.filter(
          (item) => item.status === 'In Progress'
        ).length,

        Total: processItems.length
      };

    });

  }, [data]);

  const grandTotal = useMemo(() => {

    return pivotData.reduce(
      (sum, row) => sum + row.Total,
      0
    );

  }, [pivotData]);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

      {/* Heading */}
      <div className="flex items-center gap-2 mb-6">

        <div className="h-5 w-1 rounded bg-[#4f46e5]" />

        <h2 className="font-sans text-base font-bold text-slate-800">
          Process Summary
        </h2>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-[#0c1b3d] text-white">

              <th
                className="
                  px-3 py-3
                  text-left
                  text-xs
                  font-semibold
                  text-white
                  whitespace-nowrap
                "
              >
                Process
              </th>

              <th
                className="
                  px-3 py-3
                  text-center
                  text-xs
                  font-semibold
                  text-white
                "
              >
                Done
              </th>

              <th
                className="
                  px-3 py-3
                  text-center
                  text-xs
                  font-semibold
                  text-white
                "
              >
                Pending
              </th>

              <th
                className="
                  px-3 py-3
                  text-center
                  text-xs
                  font-semibold
                  text-white
                  whitespace-nowrap
                "
              >
                In Progress
              </th>

              <th
                className="
                  px-3 py-3
                  text-center
                  text-xs
                  font-semibold
                  text-white
                "
              >
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {pivotData.map((row) => (

              <tr
                key={row.process}
                className="
                  border-b
                  border-slate-100
                  hover:bg-slate-50
                  transition
                "
              >

                <td
                  className="
                    px-3 py-3
                    text-sm
                    font-medium
                    text-slate-700
                    whitespace-nowrap
                  "
                >
                  {row.process}
                </td>

                <td
                  className="
                    px-3 py-3
                    text-center
                    text-sm
                    text-slate-600
                  "
                >
                  {row.Done}
                </td>

                <td
                  className="
                    px-3 py-3
                    text-center
                    text-sm
                    text-slate-600
                  "
                >
                  {row.Pending}
                </td>

                <td
                  className="
                    px-3 py-3
                    text-center
                    text-sm
                    text-slate-600
                  "
                >
                  {row['In Progress']}
                </td>

                <td
                  className="
                    px-3 py-3
                    text-center
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  {row.Total}
                </td>

              </tr>

            ))}

          </tbody>

          <tfoot>

            <tr className="bg-slate-50">

              <td
                className="
                  px-3 py-3
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                Grand Total
              </td>

              <td
                className="
                  px-3 py-3
                  text-center
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                {pivotData.reduce(
                  (sum, row) => sum + row.Done,
                  0
                )}
              </td>

              <td
                className="
                  px-3 py-3
                  text-center
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                {pivotData.reduce(
                  (sum, row) => sum + row.Pending,
                  0
                )}
              </td>

              <td
                className="
                  px-3 py-3
                  text-center
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                {pivotData.reduce(
                  (sum, row) =>
                    sum + row['In Progress'],
                  0
                )}
              </td>

              <td
                className="
                  px-3 py-3
                  text-center
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                {grandTotal}
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-400">
          No process data available.
        </div>
      )}

    </div>
  );
}