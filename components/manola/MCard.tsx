import { cn } from "@/lib/utils"

interface MCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
}

export function MCard({ children, className, padding = "md" }: MCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-lg shadow-sm",
        {
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
        },
        className
      )}
    >
      {children}
    </div>
  )
}
