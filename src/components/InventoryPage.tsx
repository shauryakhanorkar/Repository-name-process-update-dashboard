import React from 'react';
import { mockInventoryData } from '../data/mockInventoryBOM';

function getStatusStyle(status: string) {
  if (status === 'Available') return 'bg-green-100 text-green-700';
  if (status === 'Low Stock') return 'bg-yellow-100 text-yellow-700';
  if (status === 'Out of Stock') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export default function InventoryPage() {
  const data = mockInventoryData;

  const totalItems = data.length;
  const lowStockCount = data.filter(i => i.stockStatus === 'Low Stock').length;
  const outOfStockCount = data.filter(i => i.stockStatus === 'Out of Stock').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Materials</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{totalItems}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Low Stock Items</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">{lowStockCount}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Out of Stock</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{outOfStockCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Inventory Stock Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Material Name</th>
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">Rating</th>
                <th className="px-5 py-3 text-right">Current Stock</th>
                <th className="px-5 py-3 text-right">Min Stock</th>
                <th className="px-5 py-3 text-left">Unit</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.materialCode} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{item.materialCode}</td>
                  <td className="px-5 py-3">{item.materialName}</td>
                  <td className="px-5 py-3 text-slate-500">{item.brand}</td>
                  <td className="px-5 py-3 text-slate-500">{item.rating}</td>
                  <td className="px-5 py-3 text-right font-semibold">{item.currentStock}</td>
                  <td className="px-5 py-3 text-right text-slate-400">{item.minStock}</td>
                  <td className="px-5 py-3 text-slate-500">{item.unit}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.stockStatus)}`}>
                      {item.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}