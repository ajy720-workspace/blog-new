export type AdPosition = 'post-bottom' | 'side-floating'

export type DeviceType = 'mobile' | 'desktop'

export interface AdUnit {
  unit: string
  width: number
  height: number
  device: DeviceType
}

export interface AdConfig {
  position: AdPosition
  units: AdUnit[]
}

export const adConfigs: Record<AdPosition, AdConfig> = {
  'post-bottom': {
    position: 'post-bottom',
    units: [
      {
        unit: 'DAN-BuIWgS1qMv24Vuvf',
        width: 728,
        height: 90,
        device: 'desktop',
      },
      {
        unit: 'DAN-kJwsgAKeTp8Dmw4n',
        width: 320,
        height: 100,
        device: 'mobile',
      },
    ],
  },
  'side-floating': {
    position: 'side-floating',
    units: [
      {
        // unit: 'DAN-DAN-DaEYIjpHSolu6Tp2',
        unit: 'DAN-51IU9l6fsx2ULhVQ',
        width: 160,
        height: 600,
        device: 'desktop',
      },
    ],
  },
}

export function getAdUnitForDevice(
  position: AdPosition,
  device: DeviceType
): AdUnit | null {
  const config = adConfigs[position]
  return config.units.find(unit => unit.device === device) || null
}