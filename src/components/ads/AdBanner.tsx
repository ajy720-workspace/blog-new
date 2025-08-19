'use client'

import { useEffect, useState } from 'react'

import { AdPosition, adConfigs } from '@/lib/ads/adConfig'

import { AdScript } from './AdScript'
import './ad-styles.css'

interface AdBannerProps {
  position: AdPosition
  className?: string
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [mounted, setMounted] = useState(false)
  const config = adConfigs[position]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const positionStyles = {
    'post-bottom': 'ad-banner-post-bottom mx-auto my-8',
    'side-floating':
      'ad-banner-side-floating fixed left-4 top-1/2 -translate-y-1/2 z-10',
  }

  return (
    <>
      <div className={`${positionStyles[position]} ${className}`}>
        {config.units.map(unit => (
          <ins
            key={unit.unit}
            className={`ad-${unit.device} kakao_ad_area`}
            style={{ display: 'none' }}
            data-ad-unit={unit.unit}
            data-ad-width={unit.width.toString()}
            data-ad-height={unit.height.toString()}
            data-device-type={unit.device}
          />
        ))}
      </div>
      <AdScript />
    </>
  )
}
