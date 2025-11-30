import React from 'react';
import { FinancialMetrics } from '../types';

interface FinancialTableProps {
  data: FinancialMetrics[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const headers = [
    { key: 'name', label: 'Company' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'price', label: 'Price' },
    { key: 'marketCap', label: 'Market Cap' },
    { key: 'roe', label: 'ROE' },
    { key: 'roic', label: 'ROIC' },
    { key: 'evEbit', label: 'EV/EBIT' },
    { key: 'per', label: 'P/E' },
    { key: 'fcfPerShare', label: 'FCF/Share' },
    { key: 'beta', label: 'Beta' },
    { key: 'ke', label: 'Ke (Equity)' },
    { key: 'kd', label: 'Kd (Debt)' },
    { key: 'wacc', label: 'WACC' },
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-h-[600px] overflow-y-auto">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="px-6 py-4 whitespace-nowrap bg-slate-50">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((company, index) => (
              <tr 
                key={company.ticker} 
                className={`hover:bg-slate-50 transition-colors ${index === 0 ? 'bg-indigo-50/30' : ''}`}
              >
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {company.name}
                  {index === 0 && <span className="ml-2 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Target</span>}
                </td>
                <td className="px-6 py-4 font-mono text-slate-600">{company.ticker}</td>
                <td className="px-6 py-4 text-slate-700">{company.price}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{company.marketCap}</td>
                <td className="px-6 py-4 text-emerald-600">{company.roe}</td>
                <td className="px-6 py-4 text-emerald-600">{company.roic}</td>
                <td className="px-6 py-4 text-slate-700">{company.evEbit}</td>
                <td className="px-6 py-4 text-slate-700">{company.per}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{company.fcfPerShare}</td>
                <td className="px-6 py-4 text-slate-700">{company.beta}</td>
                <td className="px-6 py-4 text-slate-600">{company.ke}</td>
                <td className="px-6 py-4 text-slate-600">{company.kd}</td>
                <td className="px-6 py-4 font-semibold text-indigo-600">{company.wacc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTable;