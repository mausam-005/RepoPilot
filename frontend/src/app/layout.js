import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'RepoPilot',
  description: 'Repository management made easy',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}