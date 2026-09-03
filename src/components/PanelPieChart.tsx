import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChartDataPoint } from '../types';

interface PanelPieChartProps {
  data: PieChartDataPoint[];
}

const PANEL_COLORS: Record<string, string> = {
  'Meter Panel': '#06b6d4',
  'APFC Panel': '#f97316',
  'MCC Panel': '#ec4899',
  'PCC Panel': '#14b8a6',
  'PLC Panel': '#3b82f6',
  'PDB Panel': '#eab308',
  'Fidder Piller': '#f43f5e',
};

export default function PanelPieChart({
  data,
}: PanelPieChartProps) {
  const total = data.reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  const formattedData = data
    .map((item) => ({
      ...item,
      percentage:
        total > 0
          ? parseFloat(
              ((item.value / total) * 100).toFixed(1)
            )
          : 0,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full">

      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-1 rounded bg-[#4f46e5]" />

        <h2 className="font-sans text-base font-bold text-slate-800">
          Panel Update
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center">

        {/* Pie Chart */}
        <div className="h-[190px] w-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      PANEL_COLORS[entry.name] ||
                      '#94a3b8'
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(
                  _value: any,
                  _name: any,
                  props: any
                ) => [
                  `${props.payload.percentage}%`,
                  props.payload.name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '11px',
                  color: '#1e293b',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 w-full">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {data.map((item) => {
              const percentage =
                total > 0
                  ? ((item.value / total) * 100).toFixed(1)
                  : '0.0';

              return (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 min-w-0"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        PANEL_COLORS[item.name] ||
                        '#94a3b8',
                    }}
                  />

                  <span className="truncate">
                    {item.name}
                  </span>

                  <span className="text-slate-400 shrink-0">
                    ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}