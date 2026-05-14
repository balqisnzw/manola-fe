import { LucideIcon } from "lucide-react"
import { MCard } from "./MCard"

interface StatCardProps {
  label: string
  value: string
  caption?: string
  icon?: LucideIcon
  className?: string
}

export function StatCard({ label, value, caption, icon: Icon, className }: StatCardProps) {
  return (
    <MCard className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280] mb-1">{label}</p>
          <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
          {caption && (
            <p className="text-xs text-[#6B7280] mt-1">{caption}</p>
          )}
        </div>
        {Icon && (
          <div className="text-[#6B7280]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </MCard>
  )
}
