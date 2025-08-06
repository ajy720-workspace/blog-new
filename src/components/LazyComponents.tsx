import { lazy } from 'react'

export const LazyPostRenderer = lazy(() =>
  import('./post-renderer').then(module => ({ default: module.PostRenderer }))
)

export const LazySocialShare = lazy(() =>
  import('./SEO/SocialShare').then(module => ({ default: module.SocialShare }))
)

export const LazyComments = lazy(() =>
  import('./Comments').then(module => ({ default: module.Comments }))
)

export const LazyTagCloud = lazy(() =>
  import('./TagCloud').then(module => ({ default: module.TagCloud }))
)
