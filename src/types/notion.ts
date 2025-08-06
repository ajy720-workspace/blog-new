export interface NotionPost {
  id: string
  title: string
  url_path: string
  created_time: string
  tags: string[]
  published: boolean
  coverImage?: string
  category?: string
}

export interface NotionBlock {
  id: string
  type: string
  [key: string]: unknown
}

export interface PersonalInfo {
  name: string
  bio: string
  avatar?: string
  socialLinks: SocialLink[]
}

export interface SocialLink {
  platform: string
  url: string
  icon?: string
}
