import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  exportFilename?: string;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

function getNestedValue(obj: any, key: string): any {
  return key.split('.').reduce((acc, k) => acc?.[k], obj);
}

function AdminTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  pageSize = 10,
  exportFilename = 'export',
  loading = false,
  emptyMessage = 'No records found',
  actions,
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = getNestedValue(row, col.key as string);
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label).join(',');
    const rows = filtered.map((row) =>
      columns
        .map((col) => {
          const val = getNestedValue(row, col.key as string);
          const str = String(val ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 placeholder:text-brand-on-surface-variant/40 transition-colors"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-surface-container border-b border-white/8">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-brand-on-surface-variant text-sm">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-brand-on-surface-variant/50 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={(row as any)._id ?? (row as any).id ?? i} className="hover:bg-white/[0.02] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key as string} className={`px-4 py-3 text-brand-on-surface ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(getNestedValue(row, col.key as string), row)
                        : String(getNestedValue(row, col.key as string) ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-brand-on-surface-variant">
        <span>
          Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronsLeft size={14} />
          </button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page = i + 1;
            if (totalPages > 5) {
              if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${currentPage === page ? 'bg-brand-gold text-brand-surface' : 'hover:bg-white/5'}`}
              >
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronRight size={14} />
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTable;
