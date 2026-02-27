import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  striped?: boolean;
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  ({
    columns,
    data,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    onSort,
    actions,
    emptyMessage = 'No data found',
    striped = true,
  }, ref) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string, sortable?: boolean) => {
      if (!sortable) return;

      let direction: 'asc' | 'desc' = 'asc';
      if (sortKey === key && sortDirection === 'asc') {
        direction = 'desc';
      }

      setSortKey(key);
      setSortDirection(direction);
      onSort?.(key, direction);
    };

    return (
      <div ref={ref} className="w-full">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.width || ''}`}
                    onClick={() => handleSort(String(column.key), column.sortable)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortKey === String(column.key) && (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 transition-colors ${
                      striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100`}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key])}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-sm">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {data.length} items
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange?.(currentPage - 1)}
                icon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
                icon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;
