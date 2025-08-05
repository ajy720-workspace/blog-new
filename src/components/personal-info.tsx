import { Github, Twitter, Linkedin, Mail, ExternalLink, Instagram } from 'lucide-react'
import Image from 'next/image'
import { PersonalInfo } from '@/types/notion'

const SOCIAL_ICONS = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
  instagram: Instagram,
  default: ExternalLink,
}

interface PersonalInfoProps {
  info: PersonalInfo
}

export function PersonalInfoSection({ info }: PersonalInfoProps) {
  return (
    <section className="border-b pb-12 mb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {info.avatar && (
          <div className="flex-shrink-0">
            <Image
              src={info.avatar}
              alt={info.name}
              width={128}
              height={128}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-border"
            />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{info.name}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {info.bio}
            </p>
          </div>

          {info.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {info.socialLinks.map((link, index) => {
                const IconComponent =
                  SOCIAL_ICONS[link.platform as keyof typeof SOCIAL_ICONS] ||
                  SOCIAL_ICONS.default

                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="capitalize">{link.platform}</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  name: 'Your Name',
  bio: 'Welcome to my personal blog where I share thoughts on technology, development, and life. Feel free to explore my posts and connect with me through the links below.',
  socialLinks: [
    {
      platform: 'github',
      url: 'https://github.com/ajy720',
    },
    {
      platform: 'instagram',
      url: 'https://instagram.com/02.mm.dd',
    },
    {
      platform: 'email',
      url: 'mailto:ajy720@gmail.com',
    },
  ],
}
