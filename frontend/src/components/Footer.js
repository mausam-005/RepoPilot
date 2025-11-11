import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              RepoPilot
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">
              The ultimate repository management platform designed for modern development teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2 text-sm">
              <Link href="/repositories" className="block text-slate-400 hover:text-blue-400 transition-colors">Repositories</Link>
              <Link href="/issues" className="block text-slate-400 hover:text-blue-400 transition-colors">Issues</Link>
              <Link href="/bookmarks" className="block text-slate-400 hover:text-blue-400 transition-colors">Bookmarks</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-slate-400 hover:text-blue-400 transition-colors">Documentation</a>
              <a href="#" className="block text-slate-400 hover:text-blue-400 transition-colors">Help Center</a>
              <a href="#" className="block text-slate-400 hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">@ 2025 RepoPilot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}