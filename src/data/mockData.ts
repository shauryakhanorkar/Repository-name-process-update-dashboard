import { ProjectUpdate } from '../types';

// Let's create the 33 project records to perfectly match the charts and tables from the image!
export const initialProjectUpdates: ProjectUpdate[] = [
  // Neha: Quotation, Fabrication, Powder Coating, Testing, Dispatch
  {
    timestamp: '2026-07-07 09:12:00',
    customerName: 'Neha',
    projectName: 'Proj-Neha-01',
    panelType: 'APFC Panel',
    process: 'Quotation Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 10:15:00',
    customerName: 'Neha',
    projectName: 'Proj-Neha-01',
    panelType: 'APFC Panel',
    process: 'Fabrication Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 11:20:00',
    customerName: 'Neha',
    projectName: 'Proj-Neha-01',
    panelType: 'APFC Panel',
    process: 'Powder Coating Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 12:30:00',
    customerName: 'Neha',
    projectName: 'Proj-Neha-01',
    panelType: 'APFC Panel',
    process: 'Testing Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 14:00:00',
    customerName: 'Neha',
    projectName: 'Proj-Neha-01',
    panelType: 'APFC Panel',
    process: 'Dispatch Updates',
    status: 'Pending',
    date: '2026-07-07'
  },

  // thank: Quotation
  {
    timestamp: '2026-07-07 09:30:00',
    customerName: 'thank',
    projectName: 'Proj-Thank-01',
    panelType: 'Meter Panel',
    process: 'Quotation Updates',
    status: 'Done',
    date: '2026-07-07'
  },

  // polo: Quotation, Fabrication, Powder Coating
  {
    timestamp: '2026-07-07 09:45:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-01',
    panelType: 'MCC Panel',
    process: 'Quotation Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 10:50:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-01',
    panelType: 'MCC Panel',
    process: 'Fabrication Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 11:55:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-01',
    panelType: 'MCC Panel',
    process: 'Powder Coating Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },

  // plank: Quotation
  {
    timestamp: '2026-07-07 10:00:00',
    customerName: 'plank',
    projectName: 'Proj-Plank-01',
    panelType: 'PCC Panel',
    process: 'Quotation Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },

  // gang: Quotation, Fabrication, Powder Coating, Testing, Dispatch
  {
    timestamp: '2026-07-07 09:05:00',
    customerName: 'gang',
    projectName: 'Proj-Gang-01',
    panelType: 'PLC Panel',
    process: 'Quotation Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 10:10:00',
    customerName: 'gang',
    projectName: 'Proj-Gang-01',
    panelType: 'PLC Panel',
    process: 'Fabrication Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 11:15:00',
    customerName: 'gang',
    projectName: 'Proj-Gang-01',
    panelType: 'PLC Panel',
    process: 'Powder Coating Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 12:20:00',
    customerName: 'gang',
    projectName: 'Proj-Gang-01',
    panelType: 'PLC Panel',
    process: 'Testing Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 13:25:00',
    customerName: 'gang',
    projectName: 'Proj-Gang-01',
    panelType: 'PLC Panel',
    process: 'Dispatch Updates',
    status: 'Pending',
    date: '2026-07-07'
  },

  // lucky: Fabrication
  {
    timestamp: '2026-07-07 10:40:00',
    customerName: 'lucky',
    projectName: 'Proj-Lucky-01',
    panelType: 'PDB Panel',
    process: 'Fabrication Updates',
    status: 'Done',
    date: '2026-07-07'
  },

  // great: Fabrication, Dispatch
  {
    timestamp: '2026-07-07 10:35:00',
    customerName: 'great',
    projectName: 'Proj-Great-01',
    panelType: 'Fidder Piller',
    process: 'Fabrication Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 14:15:00',
    customerName: 'great',
    projectName: 'Proj-Great-01',
    panelType: 'Fidder Piller',
    process: 'Dispatch Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },

  // Additional records to make total 33 and align with charts exactly:
  // Quotation Updates needs 3 Done, 0 Pending, 2 In Progress (Sum = 5)
  // Currently Neha (Done), thank (Done), polo (Done), plank (In Progress), gang (In Progress) -> Done=3, Pending=0, In Progress=2. Perfect!

  // Fabrication Updates needs 3 Done, 2 Pending, 2 In Progress (Sum = 7)
  // Currently Neha (In Progress), polo (Done), gang (In Progress), lucky (Done), great (Done) -> Done=3, Pending=0, In Progress=2.
  // We need 2 Pending!
  {
    timestamp: '2026-07-07 15:00:00',
    customerName: 'plank',
    projectName: 'Proj-Plank-01',
    panelType: 'PCC Panel',
    process: 'Fabrication Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 15:10:00',
    customerName: 'thank',
    projectName: 'Proj-Thank-01',
    panelType: 'Meter Panel',
    process: 'Fabrication Updates',
    status: 'Pending',
    date: '2026-07-07'
  },

  // Powder Coating Updates needs 3 Done, 1 Pending, 2 In Progress (Sum = 6)
  // Currently Neha (In Progress), polo (In Progress), gang (Done) -> Done=1, Pending=0, In Progress=2.
  // We need 2 Done, 1 Pending.
  {
    timestamp: '2026-07-07 15:20:00',
    customerName: 'lucky',
    projectName: 'Proj-Lucky-01',
    panelType: 'PDB Panel',
    process: 'Powder Coating Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 15:30:00',
    customerName: 'great',
    projectName: 'Proj-Great-01',
    panelType: 'Fidder Piller',
    process: 'Powder Coating Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 15:40:00',
    customerName: 'thank',
    projectName: 'Proj-Thank-01',
    panelType: 'Meter Panel',
    process: 'Powder Coating Updates',
    status: 'Pending',
    date: '2026-07-07'
  },

  // Testing Updates needs 2 Done, 4 Pending, 2 In Progress (Sum = 8)
  // Currently Neha (Pending), gang (Pending) -> Done=0, Pending=2, In Progress=0.
  // We need 2 Done, 2 Pending, 2 In Progress.
  {
    timestamp: '2026-07-07 15:50:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-01',
    panelType: 'MCC Panel',
    process: 'Testing Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 16:00:00',
    customerName: 'lucky',
    projectName: 'Proj-Lucky-01',
    panelType: 'PDB Panel',
    process: 'Testing Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 16:10:00',
    customerName: 'plank',
    projectName: 'Proj-Plank-01',
    panelType: 'PCC Panel',
    process: 'Testing Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 16:20:00',
    customerName: 'thank',
    projectName: 'Proj-Thank-01',
    panelType: 'Meter Panel',
    process: 'Testing Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 16:30:00',
    customerName: 'great',
    projectName: 'Proj-Great-01',
    panelType: 'Fidder Piller',
    process: 'Testing Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 16:40:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-02',
    panelType: 'MCC Panel',
    process: 'Testing Updates',
    status: 'In Progress',
    date: '2026-07-07'
  },

  // Dispatch Updates needs 2 Done, 4 Pending, 1 In Progress (Sum = 7)
  // Currently Neha (Pending), gang (Pending), great (In Progress) -> Done=0, Pending=2, In Progress=1.
  // We need 2 Done, 2 Pending.
  {
    timestamp: '2026-07-07 16:50:00',
    customerName: 'lucky',
    projectName: 'Proj-Lucky-01',
    panelType: 'PDB Panel',
    process: 'Dispatch Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 17:00:00',
    customerName: 'polo',
    projectName: 'Proj-Polo-01',
    panelType: 'MCC Panel',
    process: 'Dispatch Updates',
    status: 'Done',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 17:10:00',
    customerName: 'plank',
    projectName: 'Proj-Plank-01',
    panelType: 'PCC Panel',
    process: 'Dispatch Updates',
    status: 'Pending',
    date: '2026-07-07'
  },
  {
    timestamp: '2026-07-07 17:20:00',
    customerName: 'thank',
    projectName: 'Proj-Thank-01',
    panelType: 'Meter Panel',
    process: 'Dispatch Updates',
    status: 'Pending',
    date: '2026-07-07'
  }
];

// Let's check panel wise distributions:
// APFC Panel, MCC Panel, PLC Panel, PCC Panel, Meter Panel, PDB Panel, Fidder Piller
// Panel wise pivot values from screenshot:
// APFC Panel: Pending=2, In Progress=3, Done=1
// MCC Panel: Pending=-, In Progress=2, Done=2
// PLC Panel: Pending=2, In Progress=2, Done=-
// PCC Panel: Pending=3, In Progress=-, Done=-
// Meter Panel: Pending=2, In Progress=1, Done=2
// PDB Panel: Pending=1, In Progress=-, Done=2
// Fidder Piller: Pending=-, In Progress=1, Done=-

// Let's write helper function to compute panel statistics based on actual panel counts from the data.
// We can also have an inventory schema mock if needed. But BOM records are the main record for this dashboard.
