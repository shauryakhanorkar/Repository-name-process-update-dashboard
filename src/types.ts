export interface ProjectUpdate {
  timestamp: string;

  customerName: string;

  soNumber: string;

  panelName: string;

  panelType: string;

  otherPanelTypes: string;

  process:
    | 'Quotation'
    | 'Fabrication'
    | 'Powder Coating'
    | 'Assembly and Wiring'
    | 'Testing'
    | 'Dispatch'
    | string;

  status:
    | 'Done'
    | 'Pending'
    | 'In Progress'
    | string;

  date: string;
}


export interface ChartDataPoint {
  name: string;

  Done: number;

  Pending: number;

  'In Progress': number;
}


export interface PieChartDataPoint {
  name: string;

  value: number;

  percentage?: number;
}


export interface InventoryItem {
  materialCode: string;

  materialName: string;

  brand: string;

  rating: string;

  openingStock: number;

  totalInward: number;

  totalOutward: number;

  currentStock: number;

  minStock: number;

  unit: string;

  stockStatus: string;
}


export interface BOMItem {
  panelCode: string;

  panelType: string;

  materialName: string;

  subMaterial: string;

  brand: string;

  rating: string;

  qtyRequired: number;

  unit: string;

  rate: number;
}