import Link from 'next/link'
import { Calendar, Tag } from 'lucide-react'
import { NotionPost } from '@/types/notion'

interface PostCardProps {
  post: NotionPost
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  return (
    <article className="group border rounded-lg p-6 hover:shadow-md transition-shadow">
      <Link href={`/${post.url_path}`} className="block space-y-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.created_time}>{formattedDate}</time>
            </div>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{post.tags.length} tags</span>
              </div>
            )}
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </Link>
    </article>
  )
}
