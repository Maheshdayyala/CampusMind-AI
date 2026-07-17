'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  delay?: number
  hover?: boolean
}

export default function GlassCard({ children, className, glow, delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass-card p-5 relative overflow-hidden group',
        glow && 'glow-border',
        hover && 'hover:translate-y-[-2px]',
        className
      )}
    >
      {glow && (
        <div className="absolute -inset-[1px] rounded-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          background: 'linear-gradient(135deg, rgba(26,115,232,0.15), transparent 50%, rgba(26,115,232,0.05))',
          zIndex: 0,
          borderRadius: 'inherit',
        }} />
      )}
      <div className="relative z-[1]">
        {children}
      </div>
    </motion.div>
  )
}
