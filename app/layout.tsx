import './globals.css'

export default function RootLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
      </head>
      <body className={className}>
        {children}
      </body>
    </html>
  )
}
