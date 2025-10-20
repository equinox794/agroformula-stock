'use client'

import { useTranslation } from 'react-i18next'
import { Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="border-t border-border py-8 bg-panel/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-text-muted text-sm">
            {t('footer.copyright')}
          </p>
          
          {/* Social media */}
          <div className="flex items-center space-x-4">
            <a
              href="https://linkedin.com/company/agroformula"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/agroformula"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
