# Personal Blog Template

A modern, configurable blog built with Next.js 15, TypeScript, and Notion CMS. This template is designed to be easily customized for any user while maintaining type safety and security.

## ✨ Features

- **Modern Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **CMS Integration**: Notion API for content management
- **Authentication**: JWT-based sessions with OAuth providers
- **Comments System**: Supabase-powered with rate limiting
- **SEO Optimized**: Structured data, meta tags, and sitemap
- **Fully Configurable**: Centralized configuration files
- **Security**: Rate limiting, CORS protection, and secure headers
- **Performance**: ISR, image optimization, and caching

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/blog-template.git
cd blog-template
yarn install
```

### 2. Configuration

All site customization is handled through configuration files in the `config/` directory:

#### `config/site.config.ts` - Personal Information & Branding
```typescript
export const siteConfig: SiteConfig = {
  name: "Your Blog Name",
  title: "Your Blog Title", 
  description: "Your blog description",
  url: "https://yourdomain.com",
  
  author: {
    name: "Your Name",
    email: "your@email.com",
    bio: "Your bio here...",
    avatar: "/path/to/your/avatar.jpg", // Optional
  },

  social: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourusername", // Optional
    linkedin: "https://linkedin.com/in/yourusername", // Optional
    instagram: "https://instagram.com/yourusername", // Optional
    email: "mailto:your@email.com",
  },

  metadata: {
    keywords: ["your", "keywords", "here"],
    creator: "Your Name",
    publisher: "Your Blog Name",
  }
}
```

#### `config/seo.config.ts` - SEO Settings
```typescript
export const seoConfig: SEOConfig = {
  defaultTitle: "Your Blog Title",
  titleTemplate: "%s | Your Name",
  defaultDescription: "Your blog description",
  defaultKeywords: ["blog", "technology", "your", "topics"],
  // ... other SEO settings
}
```

#### `config/security.config.ts` - Security Policies
```typescript
export const securityConfig: SecurityConfig = {
  rateLimit: {
    comments: {
      maxPerHour: 5, // Adjust comment rate limits
      windowMs: 60 * 60 * 1000
    }
  },
  allowedHosts: [
    "*.yourdomain.com", 
    "localhost:3000"
  ],
  // ... other security settings
}
```

### 3. Environment Variables

Create `.env.local` with your values:

```bash
# Required
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_NOTION_API_KEY=your_notion_api_key
NEXT_PUBLIC_NOTION_DATABASE_ID=your_notion_database_id

# Optional (for comments and auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Notion Database Setup

Create a Notion database with these properties:
- **Title** (Title): Post title
- **URLPath** (Rich Text): URL slug for the post  
- **Published** (Checkbox): Whether the post is published
- **Tags** (Multi-select): Post tags
- **Category** (Select): Post categories
- **Created** (Created time): Post creation date

### 5. Font Files (Optional)

For optimal typography, add these fonts to `src/app/fonts/`:
- `PretendardVariable.woff2` (Korean support)
- `RobotoMono-VariableFont_wght.ttf` (code blocks)

## 🛠️ Development

```bash
# Start development server
yarn dev

# Build for production  
yarn build

# Start production server
yarn start

# Lint and format code
yarn lint --fix && yarn format
```

## 📦 Project Structure

```
├── config/                  # 🎯 Configuration files
│   ├── site.config.ts      # Personal info & branding
│   ├── seo.config.ts       # SEO settings
│   └── security.config.ts  # Security policies
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components  
│   ├── lib/               # Utilities & business logic
│   └── types/             # TypeScript definitions
├── supabase/              # Database migrations
└── public/               # Static assets
```

## 🔒 Security Features

- **Rate Limiting**: Configurable comment rate limits
- **CORS Protection**: Allowed hosts validation  
- **Secure Headers**: CSP and security headers
- **Input Validation**: Form data sanitization
- **Environment Separation**: Development vs production configs

## 🎨 Customization

### Styling
- Built with **Tailwind CSS 4** and **shadcn/ui**
- Fully customizable design system
- Dark/light theme support

### Components
- Modular component architecture
- TypeScript strict mode throughout
- Reusable UI components

### SEO
- Automatic structured data generation
- Optimized meta tags and Open Graph
- Sitemap and robots.txt support

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The blog works on any platform supporting Next.js:
- Netlify
- Railway  
- Docker containers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and update configurations
4. Test thoroughly: `yarn lint && yarn build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 Development Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **Components**: Server Components by default, `"use client"` only when needed
- **Styling**: Use Tailwind CSS and shadcn/ui components  
- **Code Quality**: Run `yarn lint --fix && yarn format` before committing
- **Commits**: Use descriptive commit messages in English
- **Configuration**: Always use config files instead of hardcoded values

## 🐛 Troubleshooting

### Common Issues

**Build errors after configuration changes:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
yarn build
```

**Notion API errors:**
- Verify your API key and database ID
- Check that your Notion integration has access to the database
- Ensure database properties match the expected schema

**Supabase connection issues:**
- Verify your project URL and keys
- Check that RLS policies are properly configured
- Ensure migrations have been applied

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Notion](https://notion.so) - Content management
- [Supabase](https://supabase.com) - Backend services
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components