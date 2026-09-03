import React, { useMemo } from 'react';
import { ProjectUpdate } from '../types';

interface KPICardsProps {
  totalPanels: number;
  data: ProjectUpdate[];
}

export default function KPICards({
  totalPanels,
  data,
}: KPICardsProps) {

  /* =========================================================
     CURRENTLY ACTIVE PROJECTS

     Counts unique S.O. Numbers that have at least one
     process currently marked as "In Progress".
     ========================================================= */

  const currentlyActive = useMemo(() => {

    const activeSONumbers = new Set(
      data
        .filter(
          (item) =>
            item.status === 'In Progress'
        )
        .map(
          (item) =>
            item.soNumber
        )
        .filter(
          (so): so is string =>
            Boolean(
              so &&
              so.trim()
            )
        )
    );

    return activeSONumbers.size;

  }, [data]);


  /* =========================================================
     DISPATCH STATUS

     Only count rows belonging to the Dispatch process.
     ========================================================= */

  const dispatchStatus = useMemo(() => {

    const dispatchItems =
      data.filter(
        (item) =>
          item.process === 'Dispatch'
      );

    return {

      done:
        dispatchItems.filter(
          (item) =>
            item.status === 'Done'
        ).length,

      pending:
        dispatchItems.filter(
          (item) =>
            item.status === 'Pending'
        ).length,

      inProgress:
        dispatchItems.filter(
          (item) =>
            item.status === 'In Progress'
        ).length,

    };

  }, [data]);


  return (

    /*
     * ONE combined KPI container
     *
     * Left  = Total Panels + Currently Active
     * Right = Dispatch Status
     */

    <div className="h-full rounded-3xl bg-white p-2 shadow-lg">

      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-2">


        {/* =====================================================
            LEFT SECTION
            TOTAL PANELS + CURRENTLY ACTIVE
            ===================================================== */}

        <div className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 p-7 text-white">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[40px] border-white/10" />

          <div className="pointer-events-none absolute -bottom-16 -right-8 h-48 w-48 rounded-full border-[25px] border-white/10" />


          {/* TOTAL PANELS */}

          <div className="relative z-10">

            <p className="text-xl font-bold uppercase tracking-wide">
              Total Panels
            </p>

            <p className="mt-10 text-7xl font-extrabold leading-none">
              {totalPanels}
            </p>

          </div>


          {/* Divider */}

          <div className="relative z-10 my-8 h-px w-full bg-white/40" />


          {/* CURRENTLY ACTIVE */}

          <div className="relative z-10">

            <p className="text-xl font-bold uppercase tracking-wide">
              Currently Active
            </p>

            <div className="mt-5 flex items-center gap-4">

              <p className="text-7xl font-extrabold leading-none">
                {currentlyActive}
              </p>

              {/* Green active indicator */}

              <span
                className="h-5 w-5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"
                title="Currently active"
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT SECTION
            DISPATCH STATUS
            ===================================================== */}

        <div className="flex min-h-[380px] flex-col rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-400 p-7 text-slate-900">

          <p className="text-xl font-bold uppercase tracking-wide">
            Dispatch Status
          </p>


          {/* Divider */}

          <div className="my-6 h-px w-full bg-slate-900/25" />


          {/* DONE */}

          <div className="mb-7 flex items-baseline gap-3">

            <span className="text-4xl font-bold">
              {dispatchStatus.done}
            </span>

            <span className="text-2xl font-medium">
              Done
            </span>

          </div>


          {/* PENDING */}

          <div className="mb-7 flex items-baseline gap-3">

            <span className="text-4xl font-bold">
              {dispatchStatus.pending}
            </span>

            <span className="text-2xl font-medium">
              Pending
            </span>

          </div>


          {/* IN PROGRESS */}

          <div className="flex items-baseline gap-3">

            <span className="text-4xl font-bold">
              {dispatchStatus.inProgress}
            </span>

            <span className="text-2xl font-medium">
              In Progress
            </span>

          </div>

        </div>

      </div>

    </div>

  );
}