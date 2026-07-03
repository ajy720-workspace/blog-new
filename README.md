# Personal Blog Template

A modern, configurable blog built with Next.js 15, TypeScript, and Notion CMS. This template is designed to be easily customized for any user while maintaining type safety and security.

## ✨ Features

- **Modern Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **CMS Integration**: Notion API for content management
- **Authentication**: JWT-based sessions with OAuth providers
- **Comments System**: PostgreSQL-backed with rate limiting
- **SEO Optimized**: Structured data, meta tags, and sitemap
- **Fully Configurable**: Centralized configuration files
- **Enterprise Security**: Multi-layer protection with A-grade security rating
- **Performance**: ISR, image optimization, and caching
- **DevSecOps**: Automated security audits and dependency management

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/ajy720-workspace/blog-new.git
cd blog-new
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

# Required for comments, likes, and auth
DATABASE_URL=postgresql://postgres:password@127.0.0.1:15432/blog
SESSION_SECRET=replace-with-at-least-32-random-characters
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Optional (for webhook auto-revalidation)
NOTION_WEBHOOK_SECRET=your-secure-random-string
REVALIDATION_SECRET=your-revalidation-token
```

### 4. Notion Database Setup

Create a Notion database with these properties:
- **Title** (Title): Post title
- **URLPath** (Rich Text): URL slug for the post  
- **Published** (Checkbox): Whether the post is published
- **Tags** (Multi-select): Post tags
- **Category** (Select): Post categories
- **PublishedAt** (Published time): Post Published date(order criteria)

### 5. PostgreSQL Setup

Create and migrate the application database:

```bash
psql 'postgresql://postgres:password@127.0.0.1:15432/postgres' -c 'CREATE DATABASE blog'
psql 'postgresql://postgres:password@127.0.0.1:15432/blog' -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
```

Configure a GitHub OAuth app with callback URL:
`https://yourdomain.com/auth/callback`

#### Available Tables:
- **app_users**: Anonymous and OAuth-backed users
- **comments**: Blog post comments with user association
- **likes**: Blog post likes with authenticated and anonymous identifiers
- **profiles**: OAuth display profiles

### 6. Notion Webhook Setup (Optional - for auto-revalidation)

Set up automatic content updates when you publish posts in Notion:

#### Create the Webhook

1. **Follow the official guide**: [Webhook actions](https://www.notion.com/help/webhook-actions#send-webhook)
2. **Set up the webhook endpoint**: `https://yourdomain.com/api/webhook/notion`

#### Configure Custom Headers for Security

This webhook uses custom header authentication. Configure your webhook sender with these headers:

**Required Headers:**
- `x-webhook-secret`: `your-secure-random-string`
- `x-source`: `notion-blog-webhook`

**Environment Variables:**
```bash
# Required - matches the x-webhook-secret header
NOTION_WEBHOOK_SECRET=your-secure-random-string

# Optional - for additional webhook validation
REVALIDATION_SECRET=your-revalidation-token
```

#### Configure Webhook Content

To enable intelligent page revalidation, ensure your webhook sends these properties:
- **URLPath**: Post URL slug (required for individual post updates)
- **Tags**: Post tags (required for tag page updates) 
- **Category**: Post category (required for category page updates)

#### How it Works

- **Automatic Updates**: When you publish/update posts in Notion, your blog automatically refreshes
- **ISR Revalidation**: Uses Next.js Incremental Static Regeneration for optimal performance
- **Selective Updates**: Only revalidates affected pages, not the entire site

#### Testing the Webhook

```bash
# Test webhook with authentication headers
curl -X POST https://yourdomain.com/api/webhook/notion \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secure-random-string" \
  -H "x-source: notion-blog-webhook" \
  -d '{
    "data": {
      "object": "page",
      "id": "test-page-id",
      "properties": {
        "URLPath": {"rich_text": [{"plain_text": "test-post"}]},
        "Tags": {"multi_select": [{"name": "test"}, {"name": "webhook"}]},
        "Category": {"select": {"name": "Technology"}}
      }
    }
  }'

# Check webhook status
curl https://yourdomain.com/api/webhook/notion
```

## 🛠️ Development

```bash
# Start development server
yarn dev

# Build for production  
yarn build

# Start production server
yarn start

# Code quality and security checks
yarn lint --fix && yarn format
yarn security:check              # Run security audit
yarn type-check                 # TypeScript validation
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
├── db/                    # PostgreSQL migrations
└── public/               # Static assets
```

## 🔒 Security Features

This blog template implements **enterprise-grade security** measures:

- **Multi-layer Protection**: CSP, HSTS, XSS prevention, and clickjacking protection
- **Input Validation**: Zod schema-based validation with comprehensive sanitization
- **Rate Limiting**: API protection (60 req/min) with stricter limits on sensitive endpoints
- **Security Monitoring**: Automated logging of security events and suspicious activities
- **Dependency Management**: Weekly vulnerability scans and automated security updates
- **Error Handling**: Secure error responses that prevent information disclosure

**Security Grade: A** - Suitable for production environments.

For detailed security information, vulnerability reporting, and contribution guidelines, see our **[Security Policy](SECURITY.md)**.

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

### GitHub Actions Secrets

GitHub reserves the `GITHUB_` secret prefix, so OAuth credentials use
`OAUTH_GITHUB_*` secret names and are mapped to `GITHUB_*` environment
variables during deployment.

Required deployment secrets:
- `DATABASE_URL`
- `SESSION_SECRET`
- `OAUTH_GITHUB_CLIENT_ID`
- `OAUTH_GITHUB_CLIENT_SECRET`
- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `REVALIDATE_SECRET`
- `NOTION_WEBHOOK_SECRET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

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
- **Security**: Run `yarn security:check` before committing to ensure no vulnerabilities
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

**PostgreSQL connection issues:**
- Verify `DATABASE_URL`
- Check that your SSH tunnel is listening on the configured host and port
- Ensure migrations have been applied

### PostgreSQL Migration Issues

**Migration failed or tables not created:**
```bash
psql "$DATABASE_URL" -c '\dt'
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
```

**Comments not showing up:**
```bash
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM comments;'
```

### Notion Webhook Issues

**Webhook not triggering:**
- Verify the webhook URL is publicly accessible (not localhost)
- Check webhook secret matches your environment variable: `NOTION_WEBHOOK_SECRET`
- Ensure your integration has access to the database
- Verify custom headers are being sent: `x-webhook-secret`, `x-source`

**Authentication errors (401 Unauthorized):**
```bash
# Check if your headers match the expected format
curl -I http://localhost:3000/api/webhook/notion \
  -H "x-webhook-secret: wrong-secret"

# Should return 401 if secret is incorrect
```

**Webhook payload issues:**
- Check the Next.js server logs for webhook errors
- Verify the webhook endpoint is receiving POST requests
- Ensure the request body contains valid JSON with `data.object` structure
- Check that Notion properties match expected names: `URLPath`, `Tags`, `Category`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Notion](https://notion.so) - Content management
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components
