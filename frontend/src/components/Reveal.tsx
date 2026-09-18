import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type RevealProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: ElementType
  variant?: 'up' | 'left' | 'right'
  delay?: number
}

export function Reveal({
  children,
  className = '',
  style,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const variantClass =
    variant === 'left' ? 'reveal-left' : variant === 'right' ? 'reveal-right' : 'reveal'
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${variantClass} ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  )
}

type RevealStaggerProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function RevealStagger({ children, className = '', as: Tag = 'div' }: RevealStaggerProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <Tag ref={ref as never} className={`reveal-stagger ${visible ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  )
}
