import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export default function GlassCard({ children, className, glow, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5 relative overflow-hidden group',
        glow && 'glow-border',
        hover && 'hover:translate-y-[-2px]',
        className
      )}
    >
      {glow && (
        <div className="absolute -inset-[1px] rounded-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          background: 'linear-gradient(135deg, rgba(1,105,111,0.15), transparent 50%, rgba(1,105,111,0.05))',
          zIndex: 0,
          borderRadius: 'inherit',
        }} />
      )}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  )
}
