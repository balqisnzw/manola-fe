import { cn } from "@/lib/utils"

interface MBadgeProps {
  variant?: "success" | "warning" | "info" | "gray" | "danger"
  children: React.ReactNode
  className?: string
}

export function MBadge({ variant = "gray", children, className }: MBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-green-100 text-green-700": variant === "success",
          "bg-amber-100 text-amber-700": variant === "warning",
          "bg-blue-100 text-blue-700": variant === "info",
          "bg-gray-100 text-gray-600": variant === "gray",
          "bg-red-100 text-red-600": variant === "danger",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
