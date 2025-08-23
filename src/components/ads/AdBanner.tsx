'use client'

import { useEffect, useState } from 'react'

import { AdPosition, adConfigs } from '@/lib/ads/ad-config'

import './AdBanner.css'
import { AdScript } from './AdScript'

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
    'post-bottom': 'flex justify-center items-center mx-auto my-8',
    'side-floating':
      'hidden xl:block fixed top-1/2 -translate-y-1/2 z-10 xl:left-[calc((100vw-896px)/2-160px-2rem)] 2xl:left-[calc((100vw-896px)/2-160px-3rem)]',
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
