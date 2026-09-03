import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
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

export default function ProcessChart({
  data,
}: ProcessChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col justify-between">

      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-1 rounded bg-[#4f46e5]" />

          <h2 className="font-sans text-base font-bold text-slate-800">
            Project Count by Process and Status
          </h2>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -25,
              bottom: 20,
            }}
            barGap={4}
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
    fill: '#64748b',
    fontSize: isMobile ? 9 : 10,
  }}
  interval={0}
  angle={isMobile ? -30 : 0}
  textAnchor={isMobile ? 'end' : 'middle'}
  height={isMobile ? 70 : 50}
  tickMargin={isMobile ? 8 : 0}
  tickFormatter={(value) => {
    if (value === 'Assembly and Wiring') {
      return 'Assembly & Wiring';
    }

    return value;
  }}
/>

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: '#64748b',
                fontSize: 11,
              }}
              domain={[0, 'dataMax + 1']}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow:
                  '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '12px',
                color: '#1e293b',
              }}
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
                paddingBottom: '20px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#475569',
              }}
            />

            {/* Done */}
            <Bar
              dataKey="Done"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />

            {/* Pending */}
            <Bar
              dataKey="Pending"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />

            {/* In Progress */}
            <Bar
              dataKey="In Progress"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}