import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/components/auth/auth-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clean Report - Complete Cleaning Business Management Software",
  description: "Streamline your residential cleaning business with job management, photo documentation, time tracking, and professional reports. Start your free trial today.",
  keywords: "cleaning business software, residential cleaning, job management, cleaning reports, photo documentation, time tracking",
  authors: [{ name: "Clean Report" }],
  openGraph: {
    title: "Clean Report - Complete Cleaning Business Management Software",
    description: "Streamline your residential cleaning business with job management, photo documentation, time tracking, and professional reports.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
