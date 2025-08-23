import { lazy } from 'react'

export const LazyComments = lazy(() =>
  import('./comments').then(module => ({ default: module.Comments }))
)

export const LazyTagCloud = lazy(() =>
  import('./TagCloud').then(module => ({ default: module.TagCloud }))
)
