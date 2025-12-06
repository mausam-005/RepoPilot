import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-midnight mt-16" style={{background: 'var(--bg-secondary)'}}>
      <div className="container mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/repopilot.png" alt="RepoPilot" className="w-9 h-9 rounded-lg"/>
              <h3 className="text-2xl font-bold text-primary" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
                RepoPilot
              </h3>
            </div>
            <p className="text-muted mb-6 max-w-md">
              The ultimate repository management platform designed for modern development teams.
            </p>
          </div>
          <div>
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
              <a href="#" className="block text-muted hover:text-coral transition-colors">Contact</a>
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
