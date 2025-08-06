import { OpenGraphData, generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo'

interface MetaTagsProps {
  title: string
  description: string
  canonicalUrl: string
  openGraph?: Partial<OpenGraphData>
  keywords?: string[]
  noIndex?: boolean
}

export function MetaTags({
  title,
  description,
  canonicalUrl,
  openGraph = {},
  keywords = [],
  noIndex = false,
}: MetaTagsProps) {
  const ogData: OpenGraphData = {
    title,
    description,
    url: canonicalUrl,
    type: 'website',
    ...openGraph,
  }
  
  const ogTags = generateOpenGraphTags(ogData)
  const twitterTags = generateTwitterCardTags(ogData)
  
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {Object.entries(ogTags).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}
      
      {Object.entries(twitterTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </>
  )
}