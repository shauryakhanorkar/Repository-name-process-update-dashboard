import { InventoryItem, BOMItem } from '../types';

export const mockInventoryData: InventoryItem[] = [
  { materialCode: 'MC001', materialName: 'MCCB 63A', brand: 'Schneider', rating: '63A', openingStock: 50, totalInward: 30, totalOutward: 40, currentStock: 40, minStock: 15, unit: 'Nos', stockStatus: 'Available' },
  { materialCode: 'MC002', materialName: 'MCCB 100A', brand: 'L&T', rating: '100A', openingStock: 20, totalInward: 10, totalOutward: 25, currentStock: 5, minStock: 10, unit: 'Nos', stockStatus: 'Low Stock' },
  { materialCode: 'MC003', materialName: 'Contactor', brand: 'Siemens', rating: '32A', openingStock: 35, totalInward: 15, totalOutward: 20, currentStock: 30, minStock: 10, unit: 'Nos', stockStatus: 'Available' },
  { materialCode: 'MC004', materialName: 'Energy Meter', brand: 'L&T', rating: '3 Phase', openingStock: 15, totalInward: 5, totalOutward: 18, currentStock: 2, minStock: 5, unit: 'Nos', stockStatus: 'Out of Stock' },
  { materialCode: 'MC005', materialName: 'Copper Bus Bar', brand: 'Generic', rating: '25x5mm', openingStock: 100, totalInward: 50, totalOutward: 60, currentStock: 90, minStock: 20, unit: 'Meter', stockStatus: 'Available' },
  { materialCode: 'MC006', materialName: 'Capacitor', brand: 'Schneider', rating: '25 KVAR', openingStock: 25, totalInward: 10, totalOutward: 15, currentStock: 20, minStock: 8, unit: 'Nos', stockStatus: 'Available' },
  { materialCode: 'MC007', materialName: 'APFC Relay', brand: 'L&T', rating: '12 Step', openingStock: 10, totalInward: 5, totalOutward: 8, currentStock: 7, minStock: 5, unit: 'Nos', stockStatus: 'Available' },
  { materialCode: 'MC008', materialName: 'Indicating Lamp', brand: 'Siemens', rating: '415V', openingStock: 60, totalInward: 20, totalOutward: 55, currentStock: 25, minStock: 15, unit: 'Nos', stockStatus: 'Available' },
  { materialCode: 'MC009', materialName: 'Push Button', brand: 'Schneider', rating: 'NO/NC', openingStock: 40, totalInward: 10, totalOutward: 38, currentStock: 12, minStock: 15, unit: 'Nos', stockStatus: 'Low Stock' },
  { materialCode: 'MC010', materialName: 'Terminal Block', brand: 'Generic', rating: '4mm', openingStock: 200, totalInward: 100, totalOutward: 90, currentStock: 210, minStock: 50, unit: 'Nos', stockStatus: 'Available' },
];

export const mockBOMData: BOMItem[] = [
  { panelCode: 'MP001', panelType: 'Meter Panel', materialName: 'Energy Meter', subMaterial: 'Metering', brand: 'L&T', rating: '3 Phase', qtyRequired: 1, unit: 'Nos', rate: 4500 },
  { panelCode: 'MP001', panelType: 'Meter Panel', materialName: 'MCCB 63A', subMaterial: 'Protection', brand: 'Schneider', rating: '63A', qtyRequired: 1, unit: 'Nos', rate: 3200 },
  { panelCode: 'MP001', panelType: 'Meter Panel', materialName: 'Indicating Lamp', subMaterial: 'Indication', brand: 'Siemens', rating: '415V', qtyRequired: 3, unit: 'Nos', rate: 120 },
  { panelCode: 'AP001', panelType: 'APFC Panel', materialName: 'Capacitor', subMaterial: 'Power Factor', brand: 'Schneider', rating: '25 KVAR', qtyRequired: 6, unit: 'Nos', rate: 3800 },
  { panelCode: 'AP001', panelType: 'APFC Panel', materialName: 'APFC Relay', subMaterial: 'Control', brand: 'L&T', rating: '12 Step', qtyRequired: 1, unit: 'Nos', rate: 8500 },
  { panelCode: 'AP001', panelType: 'APFC Panel', materialName: 'Contactor', subMaterial: 'Switching', brand: 'Siemens', rating: '32A', qtyRequired: 6, unit: 'Nos', rate: 950 },
  { panelCode: 'MC001', panelType: 'MCC Panel', materialName: 'MCCB 100A', subMaterial: 'Protection', brand: 'L&T', rating: '100A', qtyRequired: 2, unit: 'Nos', rate: 5600 },
  { panelCode: 'MC001', panelType: 'MCC Panel', materialName: 'Contactor', subMaterial: 'Switching', brand: 'Siemens', rating: '32A', qtyRequired: 4, unit: 'Nos', rate: 950 },
  { panelCode: 'MC001', panelType: 'MCC Panel', materialName: 'Push Button', subMaterial: 'Control', brand: 'Schneider', rating: 'NO/NC', qtyRequired: 8, unit: 'Nos', rate: 180 },
  { panelCode: 'PD001', panelType: 'PDB Panel', materialName: 'Terminal Block', subMaterial: 'Distribution', brand: 'Generic', rating: '4mm', qtyRequired: 24, unit: 'Nos', rate: 25 },
  { panelCode: 'PD001', panelType: 'PDB Panel', materialName: 'Copper Bus Bar', subMaterial: 'Distribution', brand: 'Generic', rating: '25x5mm', qtyRequired: 3, unit: 'Meter', rate: 450 },
];