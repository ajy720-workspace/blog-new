import { Github, Instagram, Mail } from 'lucide-react'

import { siteConfig } from '@/config'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-between">
          {/* Copyright */}
          <div className="text-left text-sm text-muted-foreground md:text-left">
            © {currentYear} {siteConfig.author.name}. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start gap-4 md:items-start">
            <div className="flex items-center gap-4">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm hidden md:block">GitHub</span>
              </a>
              <a
                href={siteConfig.social.email}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
                <span className="text-sm hidden md:block">Email</span>
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm hidden md:block">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
