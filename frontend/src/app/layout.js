import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'RepoPilot',
  description: 'Repository management made easy',
  icons: {
    icon: '/repopilot.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans flex flex-col min-h-screen">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #374151'
            }
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}