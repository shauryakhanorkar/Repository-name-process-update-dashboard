import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import { Menu } from 'lucide-react';

import Sidebar from './components/Sidebar';
import InventoryPage from './components/InventoryPage';
import BOMPage from './components/BOMPage';
import Header from './components/Header';
import KPICards from './components/KPICards';
import ProcessChart from './components/ProcessChart';
import StatusPieChart from './components/StatusPieChart';
import PanelPieChart from './components/PanelPieChart';
import OtherPanelPieChart from './components/OtherPanelPieChart';
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


export default function App() {

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'bom' | 'inventory'
  >('dashboard');

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
     ALL 14 PANEL TYPES
     ========================================================= */

  const ALL_PANELS = [
    'Meter Panel',
    'PDB Panel',
    'MCC Panel',
    'APFC Panel',
    'PCC Panel',
    'PLC Panel',
    'Fidder Piller',

    'Street Light Panel',
    'High Mast Panel',
    'Enclosure Box',
    'UPS Panel',
    'Main LT Panel',
    'ACB Panel',
    'ATS Box',
  ];


  /* =========================================================
     PROCESS OPTIONS
     ========================================================= */

  const PROCESS_OPTIONS = [
    'Quotation',
    'Fabrication',
    'Powder Coating',
    'Assembly and Wiring',
    'Testing',
    'Dispatch',
  ];


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


    const panels = ALL_PANELS;


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
        soNumberMatch &&
        panelMatch &&
        processMatch &&
        statusMatch
      );
    });

  }, [
    projectUpdates,
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

  const panelPieData =
    useMemo<PieChartDataPoint[]>(() => {

      const mainPanels = [
        'Meter Panel',
        'PDB Panel',
        'MCC Panel',
        'APFC Panel',
        'PCC Panel',
        'PLC Panel',
        'Fidder Piller',
      ];


      return mainPanels.map(
        (panel) => ({
          name: panel,

          value:
            filteredUpdates.filter(
              (u) =>
                u.panelName === panel ||
                u.panelType === panel
            ).length,
        })
      );

    }, [filteredUpdates]);


  /* =========================================================
     OTHER PANEL TYPES PIE CHART
     ========================================================= */

  const otherPanelPieData =
    useMemo<PieChartDataPoint[]>(() => {

      const otherPanels = [
        'Street Light Panel',
        'High Mast Panel',
        'Enclosure Box',
        'UPS Panel',
        'Main LT Panel',
        'ACB Panel',
        'ATS Box',
      ];


      return otherPanels.map(
        (panel) => ({
          name: panel,

          value:
            filteredUpdates.filter(
              (u) =>
                u.otherPanelTypes === panel
            ).length,
        })
      );

    }, [filteredUpdates]);


  /* =========================================================
     TOTAL PANELS KPI
     =========================================================
     
     Counts UNIQUE S.O. NUMBERS only.
     ========================================================= */

  const totalPanels = useMemo(() => {

    const uniqueSONumbers =
      new Set(
        filteredUpdates
          .map(
            (item) =>
              item.soNumber
          )
          .filter(
            (value): value is string =>
              Boolean(
                value &&
                value.trim()
              )
          )
      );


    return uniqueSONumbers.size;

  }, [filteredUpdates]);


  /* =========================================================
     ACTIVE PROCESSES KPI
     ========================================================= */

  const activeProcessesCount =
    useMemo(() => {

      return Array.from(
        new Set(
          filteredUpdates
            .map(
              (u) =>
                u.process
            )
            .filter(Boolean)
        )
      ).length;

    }, [filteredUpdates]);


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

              {/* =============================================
                  PROCESS CHART + KPI CARDS
                  ============================================= */}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                <div className="lg:col-span-8">

                  <ProcessChart
                    data={
                      processChartData
                    }
                  />

                </div>


                <div className="lg:col-span-4 h-full">

                  <KPICards
                    totalPanels={
                      totalPanels
                    }

                    activeProcesses={
                      activeProcessesCount
                    }
                  />

                </div>

              </div>


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