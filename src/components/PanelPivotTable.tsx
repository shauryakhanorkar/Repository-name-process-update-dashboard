import React from 'react';
import { ProjectUpdate } from '../types';

interface PanelPivotTableProps {
  data: ProjectUpdate[];
}

export default function PanelPivotTable({ data }: PanelPivotTableProps) {
  const panelTypes = [
    'APFC Panel',
    'MCC Panel',
    'PLC Panel',
    'PCC Panel',
    'Meter Panel',
    'PDB Panel',
    'Fidder Piller'
  ];

  const statuses = ['Pending', 'In Progress', 'Done'];

  // Helper to calculate cell counts
  const getCount = (panelType: string, status: string) => {
    const count = data.filter(
      item => item.panelType === panelType && item.status === status
    ).length;
    return count > 0 ? count : '-';
  };

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="p-5 flex items-center gap-2 border-b border-slate-50">
        <div className="h-5 w-1 rounded bg-[#4f46e5]" />
        <h2 className="font-sans text-base font-bold text-slate-800">
          Panel wise Pivot Table
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[300px]">
          <thead>
            {/* Main Header */}
            <tr className="bg-[#0c1b3d] text-white">
              <th className="py-2.5 px-4 text-xs font-bold tracking-wider">
                Panel Type
              </th>
              {statuses.map((status) => (
                <th key={status} className="py-2.5 px-4 text-xs font-bold tracking-wider text-center">
                  {status}
                </th>
              ))}
            </tr>
            {/* Pivot Indicator */}
            <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-semibold text-slate-400">
              <td colSpan={1} className="py-1 px-4 uppercase">Rows: Panel Type</td>
              <td colSpan={3} className="py-1 px-4 text-right uppercase">
                STATUS / PANEL TYPE
              </td>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {panelTypes.map((panel) => (
              <tr key={panel} className="hover:bg-slate-50/80 transition duration-150">
                <td className="py-3 px-4 font-semibold text-slate-700">
                  {panel}
                </td>
                {statuses.map((status) => {
                  const val = getCount(panel, status);
                  return (
                    <td
                      key={status}
                      className={`py-3 px-4 text-center font-medium ${
                        val === '-' ? 'text-slate-300' : 'text-slate-700 bg-blue-50/10'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-slate-50/60 py-2.5 px-4 border-t border-slate-100 text-[10px] text-slate-400 text-right">
        Showing status tracking for each panel assembly
      </div>
    </div>
  );
}
