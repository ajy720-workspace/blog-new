'use client'

import { useEffect, useState } from 'react'

import { AdPosition, getAdUnitForDevice } from '@/lib/ads/adConfig'

import { AdScript } from './AdScript'

interface AdBannerProps {
  position: AdPosition
  className?: string
}

function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768
      setDeviceType(isMobile ? 'mobile' : 'desktop')
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return deviceType
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const deviceType = useDeviceType()
  const adUnit = getAdUnitForDevice(position, deviceType)

  if (!adUnit) {
    return null
  }

  const positionStyles = {
    'post-bottom': 'mx-auto my-8 flex justify-center items-center',
    'side-floating':
      'fixed left-4 top-1/2 -translate-y-1/2 z-10 hidden xl:block',
  }

  return (
    <>
      <div
        className={`${positionStyles[position]} ${className}`}
        style={{
          // width: adUnit.width.toString() + 'px',
          // height: adUnit.height.toString() + 'px',
          backgroundColor: '',
        }}
      >
        <ins
          className="kakao_ad_area"
          style={{ display: 'none' }}
          data-ad-unit={adUnit.unit}
          data-ad-width={adUnit.width.toString()}
          data-ad-height={adUnit.height.toString()}
        />
        <AdScript />
      </div>
    </>
  )
}
