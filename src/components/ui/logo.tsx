// src/components/ui/logo.tsx
import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const dimensions = {
    sm: 24,
    md: 40,
    lg: 64,
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  const logoSize = dimensions[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon from SVG file */}
      <Image
        src="/logo.svg"
        alt="Blog Logo"
        width={logoSize}
        height={logoSize}
        className="rounded-sm shadow-sm"
        priority
      />

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} tracking-tight`}>
          Blog
        </span>
      )}
    </div>
  )
}

export default Logo
