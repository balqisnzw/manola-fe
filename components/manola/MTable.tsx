"use client"

import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  label: string
  render?: (item: T, index: number) => React.ReactNode
  className?: string
}

interface MTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "Tidak ada data",
  className,
}: MTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider px-4 py-3",
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#6B7280] text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[#E5E7EB] hover:bg-[#F9F9F9] transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 text-sm", column.className)}>
                    {column.render
                      ? column.render(item, index)
                      : (item[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
