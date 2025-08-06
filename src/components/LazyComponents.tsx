import { lazy } from 'react'

export const LazyPostRenderer = lazy(() => 
  import('./post-renderer').then(module => ({ default: module.PostRenderer }))
)

export const LazySocialShare = lazy(() => 
  import('./SEO/SocialShare').then(module => ({ default: module.SocialShare }))
)