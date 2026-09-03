import React, { useMemo, useState } from 'react';
import { mockBOMData } from '../data/mockInventoryBOM';

export default function BOMPage() {
  const data = mockBOMData;

  const panelTypes = useMemo(() => {
    return Array.from(new Set(data.map(d => d.panelType)));
  }, [data]);

  const [selectedPanel, setSelectedPanel] = useState('All');

  const filteredData = useMemo(() => {
    if (selectedPanel === 'All') return data;
    return data.filter(d => d.panelType === selectedPanel);
  }, [data, selectedPanel]);

  const totalCost = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.qtyRequired * item.rate, 0);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Filter + Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter by Panel Type</label>
          <select
            value={selectedPanel}
            onChange={e => setSelectedPanel(e.target.value)}
            className="mt-1 block w-full sm:w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <option value="All">All Panels</option>
            {panelTypes.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white px-6 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-100">Estimated Total Cost</div>
          <div className="text-2xl font-bold mt-1">₹{totalCost.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Bill of Materials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Panel Code</th>
                <th className="px-5 py-3 text-left">Panel Type</th>
                <th className="px-5 py-3 text-left">Material</th>
                <th className="px-5 py-3 text-left">Sub Material</th>
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">Rating</th>
                <th className="px-5 py-3 text-right">Qty</th>
                <th className="px-5 py-3 text-right">Rate (₹)</th>
                <th className="px-5 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{item.panelCode}</td>
                  <td className="px-5 py-3">{item.panelType}</td>
                  <td className="px-5 py-3">{item.materialName}</td>
                  <td className="px-5 py-3 text-slate-500">{item.subMaterial}</td>
                  <td className="px-5 py-3 text-slate-500">{item.brand}</td>
                  <td className="px-5 py-3 text-slate-500">{item.rating}</td>
                  <td className="px-5 py-3 text-right">{item.qtyRequired}</td>
                  <td className="px-5 py-3 text-right">{item.rate.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-right font-semibold">{(item.qtyRequired * item.rate).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}