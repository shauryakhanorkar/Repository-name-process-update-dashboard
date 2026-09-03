import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  totalPanels: number;
  activeProcesses: number;
}

export default function KPICards({
  totalPanels,
  activeProcesses
}: KPICardsProps) {

  return (

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:h-full">

      {/* =====================================================
          TOTAL PANELS
          ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] p-8 text-white shadow-lg flex flex-col h-[180px] sm:h-full">

        {/* Decorative circles */}

        <div className="absolute right-0 bottom-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-white/5" />

        <div className="absolute right-0 bottom-0 h-44 w-44 translate-x-12 translate-y-12 rounded-full bg-white/5" />


        {/* Icon */}

        <div className="absolute left-6 top-6 text-white/20">

          <Activity
            className="h-10 w-10 stroke-[1.5]"
          />

        </div>


        <div className="z-10">

          <span className="text-lg font-bold uppercase tracking-wider text-white/90">
            TOTAL PANELS
          </span>


          <div className="mt-7 text-8xl font-black tracking-tight text-white">
            {totalPanels}
          </div>

        </div>

      </div>


      {/* =====================================================
          ACTIVE PROCESSES
          ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] p-8 text-white shadow-lg flex flex-col h-[180px] sm:h-full">

        {/* Decorative circles */}

        <div
          className="absolute right-0 bottom-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-white/5 animate-pulse"
          style={{
            animationDuration: '6s'
          }}
        />

        <div className="absolute right-0 bottom-0 h-44 w-44 translate-x-12 translate-y-12 rounded-full bg-white/5" />


        {/* Icon */}

        <div className="absolute left-6 top-6 text-white/20">

          <TrendingUp
            className="h-10 w-10 stroke-[1.5]"
          />

        </div>


        <div className="z-10">

          <span className="text-lg font-bold uppercase tracking-wider text-white/90">
            ACTIVE PROCESSES
          </span>


          <div className="mt-1 text-8xl font-black tracking-tight text-white">
            {activeProcesses}
          </div>

        </div>

      </div>

    </div>

  );
}