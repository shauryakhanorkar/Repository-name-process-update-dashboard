import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface ProcessChartProps {
  data: ChartDataPoint[];
}

function ProcessTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length) {
    return null;
  }

  const getValue = (dataKey: string) => Number(
    payload.find((entry: any) => entry.dataKey === dataKey)?.value ?? 0
  );
  const done = getValue('Done');
  const inProgress = getValue('In Progress');
  const pending = getValue('Pending');
  const total = done + inProgress + pending;
  const completion = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">
        Process: {label}
      </p>
      <div className="space-y-1 text-slate-600">
        <p><span className="font-medium text-emerald-600">Done:</span> {done}</p>
        <p><span className="font-medium text-amber-600">In Progress:</span> {inProgress}</p>
        <p><span className="font-medium text-red-600">Pending:</span> {pending}</p>
        <div className="my-1 border-t border-slate-100" />
        <p><span className="font-medium text-slate-700">Total:</span> {total}</p>
        <p><span className="font-medium text-slate-700">Completion:</span> {completion.toFixed(1)}%</p>
      </div>
    </div>
  );
}

export default function ProcessChart({
  data,
}: ProcessChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col justify-between">

      <div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded bg-[#4f46e5]" />

          <h2 className="font-sans text-base font-bold text-slate-800">
            Project Count by Process and Status
          </h2>
        </div>
        <p className="mt-1 pl-3 text-xs text-slate-400">
          Process performance and current workload
        </p>
      </div>

      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            margin={{
              top: 22,
              right: 8,
              left: -18,
              bottom: isMobile ? 48 : 30,
            }}
            barGap={3}
            barCategoryGap="24%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: '#0f172a',
                fontSize: isMobile ? 9 : 10,
              }}
              interval={0}
              angle={isMobile ? -28 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 58 : 38}
              tickMargin={isMobile ? 8 : 4}
              tickFormatter={(value) =>
                value === 'Assembly and Wiring'
                  ? 'Assembly & Wiring'
                  : value
              }
            />

            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: '#64748b',
                fontSize: 10,
              }}
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
            />

            <Tooltip
              content={<ProcessTooltip />}
              cursor={{
                fill: '#f8fafc',
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingBottom: '8px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#475569',
              }}
            />

            {/* Done */}
            <Bar
              dataKey="Done"
              fill="#16a34a"
              radius={[5, 5, 0, 0]}
              maxBarSize={20}
            >
              <LabelList
                dataKey="Done"
                position="top"
                fill="#166534"
                fontSize={9}
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>

            {/* In Progress */}
            <Bar
              dataKey="In Progress"
              fill="#f59e0b"
              radius={[5, 5, 0, 0]}
              maxBarSize={20}
            >
              <LabelList
                dataKey="In Progress"
                position="top"
                fill="#b45309"
                fontSize={9}
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>

            {/* Pending */}
            <Bar
              dataKey="Pending"
              fill="#ef4444"
              radius={[5, 5, 0, 0]}
              maxBarSize={20}
            >
              <LabelList
                dataKey="Pending"
                position="top"
                fill="#b91c1c"
                fontSize={9}
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}