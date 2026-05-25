'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { ReactNode, CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  threshold?: number
}

export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 600,
  threshold = 0.12,
}: FadeInProps) {
  const { ref, visible } = useScrollAnimation<HTMLDivElement>({ threshold })

  const translate = {
    up:    'translateY(32px)',
    down:  'translateY(-32px)',
    left:  'translateX(32px)',
    right: 'translateX(-32px)',
    none:  'none',
  }[direction]

  const style: CSSProperties = {
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    transitionDelay: `${delay}ms`,
    opacity:   visible ? 1 : 0,
    transform: visible ? 'none' : translate,
  }

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}
