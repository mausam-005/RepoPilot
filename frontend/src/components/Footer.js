'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-midnight mt-16" style={{background: 'var(--bg-secondary)'}}>
      <div className="container mx-auto px-12 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/repopilot.png" alt="RepoPilot" className="w-9 h-9 rounded-lg"/>
              <h3 className="text-2xl font-bold text-primary" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
                RepoPilot
              </h3>
            </div>
            <p className="text-muted mb-4 max-w-md">
              The ultimate repository management platform designed for modern development teams.
            </p>
            <p className="text-sm sm:text-base text-muted max-w-md pt-3.5 mt-2 border-t border-midnight">
              Command your code cosmos,<br className="sm:hidden" /> co-piloted by{' '}
              <a 
                href="https://portfolio-of-mausam.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:text-coral transition-all mausam-link"
              >
                Mausam
              </a>.
            </p>
            <style jsx>{`
              .mausam-link {
                position: relative;
                text-shadow: none;
                transition: all 0.3s ease;
              }
              .mausam-link::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 1px;
                bottom: -2px;
                left: 0;
                background-color: #ff6b6b;
                transform: scaleX(0);
                transition: transform 0.3s ease;
              }
              .mausam-link:hover {
                color: #ff6b6b;
              }
              .mausam-link:hover::after {
                transform: scaleX(1);
              }
            `}</style>
          </div>
          <div className="pt-6 border-t border-midnight md:pt-0 md:border-t-0">
            <h4 className="font-semibold text-primary mb-4">Product</h4>
            <div className="space-y-2 text-sm">
              <Link href="/repositories" className="block text-muted hover:text-coral transition-colors">Repositories</Link>
              <Link href="/issues" className="block text-muted hover:text-coral transition-colors">Issues</Link>
              <Link href="/bookmarks" className="block text-muted hover:text-coral transition-colors">Bookmarks</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted hover:text-coral transition-colors">Documentation</a>
              <a href="#" className="block text-muted hover:text-coral transition-colors">Help Center</a>
              <a href="https://portfolio-of-mausam.netlify.app/" target="_blank" rel="noopener noreferrer" className="block text-muted hover:text-coral transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-midnight mt-8 pt-8 text-center">
          <p className="text-muted text-sm">© 2025 RepoPilot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
