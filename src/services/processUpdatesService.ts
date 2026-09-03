import { supabase } from '../lib/supabaseClient';
import { ProjectUpdate } from '../types';


/* =========================================================
   SUPABASE ROW TYPE
   ========================================================= */

interface ProcessUpdateRow {
  id: number;

  process_order: number;

  process: string | null;

  timestamp: string | null;

  employee_email: string | null;

  so_number: string | null;

  customer_name: string | null;

  date: string | null;

  status: string | null;

  panel_type: string | null;

  other_panel_types: string | null;

  employee_name: string | null;

  quotation_no: string | null;

  panel_name: string | null;

  current_stage: string | null;

  details: unknown;

  form_name: string | null;
}


/* =========================================================
   CONVERT SUPABASE ROW → PROJECT UPDATE
   ========================================================= */

function mapSupabaseRowToProjectUpdate(
  row: ProcessUpdateRow
): ProjectUpdate {

  return {
    timestamp: row.timestamp ?? '',

    customerName: row.customer_name ?? '',

    /*
     * Supabase:
     * so_number
     *
     * React:
     * soNumber
     */
    soNumber: row.so_number ?? '',

    /*
     * Supabase:
     * panel_name
     *
     * React:
     * panelName
     */
    panelName: row.panel_name ?? '',

    /*
     * Supabase:
     * panel_type
     *
     * React:
     * panelType
     */
    panelType: row.panel_type ?? '',

    /*
     * Supabase:
     * other_panel_types
     *
     * React:
     * otherPanelTypes
     */
    otherPanelTypes: row.other_panel_types ?? '',

    process: row.process ?? '',

    status: row.status ?? '',

    date: row.date ?? ''
  };
}


/* =========================================================
   FETCH PROCESS UPDATES
   ========================================================= */

export async function fetchProcessUpdates(): Promise<ProjectUpdate[]> {

  const { data, error } = await supabase
    .from('process_updates')
    .select(`
      id,
      process_order,
      process,
      timestamp,
      employee_email,
      so_number,
      customer_name,
      date,
      status,
      panel_type,
      other_panel_types,
      employee_name,
      quotation_no,
      panel_name,
      current_stage,
      details,
      form_name
    `)
    .order('process_order', {
      ascending: true
    });


  /* =======================================================
     SUPABASE ERROR
     ======================================================= */

  if (error) {

    console.error(
      'Supabase error:',
      error
    );

    throw new Error(
      error.message
    );
  }


  /* =======================================================
     NO DATA
     ======================================================= */

  if (!data) {
    return [];
  }


  /* =======================================================
     CONVERT SUPABASE DATA
     ======================================================= */

  const rows: ProcessUpdateRow[] = data.map((row) => ({
    id: row.id,

    process_order: row.process_order,

    process: row.process,

    timestamp: row.timestamp,

    employee_email: row.employee_email,

    so_number: row.so_number,

    customer_name: row.customer_name,

    date: row.date,

    status: row.status,

    panel_type: row.panel_type,

    other_panel_types: row.other_panel_types,

    employee_name: row.employee_name,

    quotation_no: row.quotation_no,

    panel_name: row.panel_name,

    current_stage: row.current_stage,

    details: row.details,

    form_name: row.form_name
  }));


  /* =======================================================
     RETURN DASHBOARD DATA
     ======================================================= */

  return rows.map(
    mapSupabaseRowToProjectUpdate
  );
}