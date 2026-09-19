import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Menu,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import InventoryPage from './components/InventoryPage';
import BOMPage from './components/BOMPage';
import ProductionPage from './components/ProductionPage';
import ReportsPage from './components/ReportsPage';
import Header from './components/Header';
import ProcessChart from './components/ProcessChart';
import StatusPieChart from './components/StatusPieChart';
import PanelPieChart from './components/PanelPieChart';
import OtherPanelPieChart from './components/OtherPanelPieChart';
import NotesPage from './components/NotesPage';
import ProcessPivotTable from './components/ProcessPivotTable';
import PanelPivotTable from './components/PanelPivotTable';

import {
  ProjectUpdate,
  ChartDataPoint,
  PieChartDataPoint,
} from './types';

import {
  fetchProcessUpdates,
} from './services/processUpdatesService';
import { PROCESS_OPTIONS } from './constants/processes';
import { businessDateKey, isActualSubmittedUpdate } from './lib/projectDates';

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateTimestamp(update: ProjectUpdate): number {
  const parsed = Date.parse(update.timestamp || update.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isCompletedStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'done' || normalizedStatus === 'completed';
}

function isInProgressStatus(status: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === 'in progress' || normalizedStatus === 'in-progress' || normalizedStatus === 'inprogress';
}


export default function App() {

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'production' | 'notes' | 'dispatch' | 'reports' | 'bom' | 'inventory'
  >('dashboard');

  const [selectedProductionSONumber, setSelectedProductionSONumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));

  // Navigation is a drawer so the dashboard never loses horizontal space.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  /* =========================================================
     PROJECT DATA
     ========================================================= */

  const [projectUpdates, setProjectUpdates] =
    useState<ProjectUpdate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);


  /* =========================================================
     LOAD DATA FROM SUPABASE
     ========================================================= */

  const loadProjectUpdates = async () => {

    try {

      setLoading(true);

      setErrorMessage(null);

      const data =
        await fetchProcessUpdates();

      setProjectUpdates(data);

    } catch (error) {

      console.error(
        'Failed to load Supabase data:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load data from Supabase.'
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadProjectUpdates();
  }, []);


  /* =========================================================
     SUCCESS MESSAGE
     ========================================================= */

  const [successMsg, setSuccessMsg] =
    useState<string | null>(null);


  /* =========================================================
     LAST UPDATED
     ========================================================= */

  const [lastUpdated, setLastUpdated] =
    useState<string>(() =>
      new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      })
    );


  /* =========================================================
     REFRESH
     ========================================================= */

  const handleRefresh = async () => {

    await loadProjectUpdates();

    setLastUpdated(
      new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      })
    );

    setSuccessMsg(
      'Dashboard refreshed successfully.'
    );
  };


  /* =========================================================
     SUCCESS MESSAGE TIMER
     ========================================================= */

  useEffect(() => {

    if (successMsg) {

      const t = setTimeout(
        () => setSuccessMsg(null),
        4000
      );

      return () => clearTimeout(t);
    }

  }, [successMsg]);


  /* =========================================================
     FILTER STATES
     ========================================================= */

  const [selectedSONumber, setSelectedSONumber] =
    useState('All');

  const [selectedPanel, setSelectedPanel] =
    useState('All');

  const [selectedProcess, setSelectedProcess] =
    useState('All');

  const [selectedStatus, setSelectedStatus] =
    useState('All');


  /* =========================================================
     PROCESS OPTIONS
     ========================================================= */

  /* =========================================================
     FILTER OPTIONS
     ========================================================= */

  const filterOptions = useMemo(() => {

    const soNumbers = Array.from(
      new Set(
        projectUpdates
          .map((u) => u.soNumber)
          .filter(
            (value): value is string =>
              Boolean(
                value &&
                value.trim()
              )
          )
      )
    ).sort();


    const panels = Array.from(
      new Set(
        projectUpdates.flatMap((update) => [
          update.panelName,
          update.panelType,
          update.otherPanelTypes,
        ])
      )
    ).filter(
      (panel): panel is string =>
        Boolean(panel?.trim()) &&
        panel.trim().toUpperCase() !== 'N/A'
    );


    const statuses = [
      'Pending',
      'In Progress',
      'Done',
    ];


    return {
      soNumbers,
      panels,
      processes: PROCESS_OPTIONS,
      statuses,
    };

  }, [projectUpdates]);


  /* =========================================================
     FILTER DATA
     ========================================================= */

  const filteredUpdates = useMemo(() => {

    return projectUpdates.filter((item) => {

      /* S.O. NUMBER */

      const soNumberMatch =
        selectedSONumber === 'All' ||
        item.soNumber === selectedSONumber;


      /* PANEL */

      const panelMatch =
        selectedPanel === 'All' ||
        item.panelName === selectedPanel ||
        item.panelType === selectedPanel ||
        item.otherPanelTypes === selectedPanel;


      /* PROCESS */

      const processMatch =
        selectedProcess === 'All' ||
        item.process === selectedProcess;


      /* STATUS */

      const statusMatch =
        selectedStatus === 'All' ||
        item.status === selectedStatus;


      return (
        isActualSubmittedUpdate(item) &&
        businessDateKey(item) === selectedDate &&
        soNumberMatch &&
        panelMatch &&
        processMatch &&
        statusMatch
      );
    });

  }, [
    projectUpdates,
    selectedDate,
    selectedSONumber,
    selectedPanel,
    selectedProcess,
    selectedStatus,
  ]);


  /* =========================================================
     PROCESS BAR CHART
     ========================================================= */

  const processChartData =
    useMemo<ChartDataPoint[]>(() => {

      return PROCESS_OPTIONS.map(
        (process) => {

          const items =
            filteredUpdates.filter(
              (u) =>
                u.process === process
            );


          return {
            name: process,

            Done:
              items.filter(
                (u) =>
                  u.status === 'Done'
              ).length,

            Pending:
              items.filter(
                (u) =>
                  u.status === 'Pending'
              ).length,

            'In Progress':
              items.filter(
                (u) =>
                  u.status === 'In Progress'
              ).length,
          };
        }
      );

    }, [filteredUpdates]);


  /* =========================================================
     STATUS PIE CHART
     ========================================================= */

  const statusPieData =
    useMemo<PieChartDataPoint[]>(() => {

      const statuses = [
        'Done',
        'Pending',
        'In Progress',
      ];


      return statuses.map(
        (status) => ({
          name: status,

          value:
            filteredUpdates.filter(
              (u) =>
                u.status === status
            ).length,
        })
      );

    }, [filteredUpdates]);


  /* =========================================================
     MAIN PANEL PIE CHART
     ========================================================= */

  const panelCategoryData = useMemo(() => {
    const panelCategories = [
      'Meter Panel',
      'PDB Panel',
      'MCC Panel',
      'APFC Panel',
      'PCC Panel',
      'Enclosure Box',
      'ACB Panel',
      'ATS Box',
    ];
    const otherPanelCategories = [
      'Street Light Panel',
      'High Mast Panel',
      'UPS Panel',
      'Main LT Panel',
      'PLC Panel',
      'Fidder Piller',
    ];
    const normalizePanelValue = (value: string | null | undefined) =>
      value?.trim().toLocaleLowerCase() || '';
    const panelCategoryByKey = new Map(
      panelCategories.map((category) => [normalizePanelValue(category), category])
    );
    const otherPanelCategoryByKey = new Map(
      otherPanelCategories.map((category) => [normalizePanelValue(category), category])
    );
    const panelCounts = new Map<string, number>([
      ...panelCategories.map((category) => [category, 0] as const),
      ['N/A', 0],
    ]);
    const otherPanelCounts = new Map<string, number>([
      ...otherPanelCategories.map((category) => [category, 0] as const),
      ['N/A', 0],
    ]);

    filteredUpdates.forEach((update) => {
      const panelCategory = panelCategoryByKey.get(normalizePanelValue(update.panelType));
      const otherPanelCategory = otherPanelCategoryByKey.get(normalizePanelValue(update.otherPanelTypes));

      if (panelCategory) {
        panelCounts.set(panelCategory, (panelCounts.get(panelCategory) || 0) + 1);
      } else if (otherPanelCategory) {
        otherPanelCounts.set(otherPanelCategory, (otherPanelCounts.get(otherPanelCategory) || 0) + 1);
      } else {
        panelCounts.set('N/A', (panelCounts.get('N/A') || 0) + 1);
      }
    });

    return {
      panel: panelCategories.concat('N/A').map((name) => ({
        name,
        value: panelCounts.get(name) || 0,
      })),
      other: otherPanelCategories.concat('N/A').map((name) => ({
        name,
        value: otherPanelCounts.get(name) || 0,
      })),
    };
  }, [filteredUpdates]);

  const panelPieData =
    useMemo<PieChartDataPoint[]>(() => {
      return panelCategoryData.panel;
    }, [panelCategoryData]);


  /* =========================================================
     OTHER PANEL TYPES PIE CHART
     ========================================================= */

  const otherPanelPieData =
    useMemo<PieChartDataPoint[]>(() => {
      return panelCategoryData.other;
    }, [panelCategoryData]);


  /* =========================================================
     DAILY DASHBOARD KPIS
     ========================================================= */

  const dailyKpis = useMemo(() => {
    const selectedDateUpdates = projectUpdates.filter(
      (update) => isActualSubmittedUpdate(update) && businessDateKey(update) === selectedDate && update.process.trim()
    );
    const selectedProjects = new Set(
      selectedDateUpdates
        .map((update) => update.soNumber.trim())
        .filter(Boolean)
    );
    const latestByProject = new Map<string, ProjectUpdate>();

    selectedDateUpdates.forEach((update) => {
      const soNumber = update.soNumber.trim();
      if (!soNumber || !selectedProjects.has(soNumber)) return;

      const current = latestByProject.get(soNumber);
      if (!current || updateTimestamp(update) > updateTimestamp(current) || (
        updateTimestamp(update) === updateTimestamp(current) &&
        (update.processOrder ?? 0) > (current.processOrder ?? 0)
      )) {
        latestByProject.set(soNumber, update);
      }
    });

    const latestUpdates = Array.from(latestByProject.values());
    const completed = latestUpdates.filter((update) => isCompletedStatus(update.status)).length;
    const inProgress = latestUpdates.filter((update) => isInProgressStatus(update.status)).length;
    const pending = latestUpdates.filter((update) => update.status.trim().toLowerCase() === 'pending').length;
    const health = latestUpdates.length === 0
      ? { label: 'NO UPDATES', subtitle: 'No production activity', color: 'slate' }
      : pending > 0
        ? { label: 'AT RISK', subtitle: 'Needs monitoring', color: 'orange' }
        : completed === latestUpdates.length
          ? { label: 'HEALTHY', subtitle: 'Normal production', color: 'emerald' }
          : { label: 'ATTENTION', subtitle: 'Needs attention', color: 'purple' };

    return {
      projects: selectedProjects.size,
      completed,
      inProgress,
      pending,
      health,
    };
  }, [projectUpdates, selectedDate]);



  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <div className="min-h-screen bg-[#f4f7fc] font-sans text-slate-800 antialiased">

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Slim application bar. The drawer opens over the page, so this never reserves sidebar width. */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-10">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <Menu className="h-5 w-5 transition group-hover:scale-105" />
          </button>

          <div className="hidden items-center gap-2 text-right sm:flex">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Rudra Electricals
            </div>
          </div>
        </div>
      </div>

      <main className="w-full pb-10 sm:pb-12">
        <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 pt-5 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 2xl:px-10">


          {/* =================================================
              HEADER
              ================================================= */}

          {activeTab === 'dashboard' && (
            <Header
              soNumbers={
                filterOptions.soNumbers
              }

            panels={
              filterOptions.panels
            }

            processes={
              filterOptions.processes
            }

            statuses={
              filterOptions.statuses
            }

            selectedSONumber={
              selectedSONumber
            }

            selectedPanel={
              selectedPanel
            }

            selectedProcess={
              selectedProcess
            }

            selectedStatus={
              selectedStatus
            }

            onSONumberChange={
              setSelectedSONumber
            }

            onPanelChange={
              setSelectedPanel
            }

            onProcessChange={
              setSelectedProcess
            }

            onStatusChange={
              setSelectedStatus
            }

              onRefresh={
                handleRefresh
              }
            />
          )}


          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center text-sm text-slate-500">

              Loading data from Supabase...

            </div>
          )}


          {/* =================================================
              ERROR
              ================================================= */}

          {!loading && errorMessage && (

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">

              <div className="font-semibold text-red-700">
                Unable to load dashboard data
              </div>

              <div className="mt-1 text-sm text-red-600">
                {errorMessage}
              </div>

              <button
                onClick={loadProjectUpdates}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>
          )}


          {/* =================================================
              DASHBOARD
              ================================================= */}

          {!loading &&
            !errorMessage &&
            activeTab === 'dashboard' && (

            <>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex min-h-[116px] flex-col justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm shadow-blue-100/60">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Today's Projects
                    </p>
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold leading-none text-slate-800">
                    {dailyKpis.projects}
                  </p>
                  <p className="text-[11px] font-medium text-blue-700">Projects updated on selected date</p>
                </div>

                <div className="flex min-h-[116px] flex-col justify-between rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm shadow-orange-100/60">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                      Completed Today
                    </p>
                    <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                      <LoaderCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold leading-none text-slate-800">
                    {dailyKpis.completed}
                  </p>
                  <p className="text-[11px] font-medium text-orange-700">Completed on selected date</p>
                </div>

                <div className="flex min-h-[116px] flex-col justify-between rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm shadow-purple-100/60">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                      In Progress Today
                    </p>
                    <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
                      <Clock3 className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold leading-none text-slate-800">
                    {dailyKpis.inProgress}
                  </p>
                  <p className="text-[11px] font-medium text-purple-700">Currently in production</p>
                </div>

                <div className="flex min-h-[116px] flex-col justify-between rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm shadow-emerald-100/60">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Production Health
                    </p>
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold leading-none ${
                    dailyKpis.health.color === 'emerald' ? 'text-emerald-700' :
                      dailyKpis.health.color === 'orange' ? 'text-orange-700' :
                        dailyKpis.health.color === 'purple' ? 'text-purple-700' : 'text-slate-600'
                  }`}>
                    {dailyKpis.health.label}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-700">{dailyKpis.health.subtitle}</p>
                </div>
              </div>

              <ProcessChart
                data={projectUpdates}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectOrder={(soNumber) => {
                  setSelectedProductionSONumber(soNumber);
                  setActiveTab('production');
                }}
              />


              {/* =============================================
                  THREE PIE CHARTS
                  ============================================= */}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <StatusPieChart
                  data={
                    statusPieData
                  }
                />


                <PanelPieChart
                  data={
                    panelPieData
                  }
                />


                <OtherPanelPieChart
                  data={
                    otherPanelPieData
                  }
                />

              </div>


              {/* =============================================
                  PIVOT TABLES
                  ============================================= */}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <ProcessPivotTable
                  data={
                    filteredUpdates
                  }
                  allData={
                    projectUpdates
                  }
                  selectedDate={selectedDate}
                  onSelectOrder={(soNumber) => {
                    setSelectedProductionSONumber(soNumber);
                    setActiveTab('production');
                  }}
                />


                <PanelPivotTable
                  data={
                    filteredUpdates
                  }
                />

              </div>

            </>
          )}


          {/* =================================================
              PRODUCTION
              ================================================= */}

          {!loading &&
            !errorMessage &&
            activeTab === 'production' && (
              <ProductionPage data={projectUpdates} selectedSONumber={selectedProductionSONumber} />
            )}


          {/* =================================================
              BOM
              ================================================= */}

          {activeTab === 'bom' && (
            <BOMPage />
          )}


          {/* =================================================
              INVENTORY
              ================================================= */}

          {activeTab === 'inventory' && (
            <InventoryPage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage data={projectUpdates} />
          )}

          {activeTab === 'notes' && (
            <NotesPage data={projectUpdates} />
          )}


          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-400 font-medium gap-2">

            <div>
              Data Last Updated: {lastUpdated}
            </div>


            <div className="flex items-center gap-4">

              <a
                href="#"
                className="hover:text-slate-600 transition"
              >
                Privacy Policy
              </a>


              <span>
                &bull;
              </span>


              <a
                href="#"
                className="hover:text-slate-600 transition"
              >
                Terms of Service
              </a>

            </div>

          </div>

        </div>
      </main>

    </div>
  );
}