import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

/**
 * Reusable DataTable component
 * Encapsulates HeroUI Table to standardize styling, z-index handling (for dropdown overlaps),
 * and empty states across the application.
 */
export default function DataTable({
  columns = [],
  data = [],
  emptyContent = "No records found.",
  onRowClick,
  renderCell,
  keyField = "id",
  ariaLabel = "Data table",
  className = "",
  ...props
}) {
  return (
    <Table
      aria-label={ariaLabel}
      className={`z-0 ${className}`}
      classNames={{
        wrapper: "shadow-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl overflow-hidden",
        th: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold z-10",
        td: "py-3 border-b border-slate-100 dark:border-slate-800 last:border-0",
      }}
      removeWrapper={false}
      {...props}
    >
      <TableHeader>
        {columns.map((col) => (
          <TableColumn key={col.key} align={col.align || "start"}>
            {col.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody items={data} emptyContent={emptyContent}>
        {(item) => (
          <TableRow
            key={item[keyField] || item.id}
            className={onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" : ""}
            onClick={() => onRowClick && onRowClick(item)}
          >
            {(columnKey) => (
              <TableCell>
                {renderCell ? renderCell(item, columnKey) : item[columnKey] || (
                  <span className="text-slate-400 italic">N/A</span>
                )}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
