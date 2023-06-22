import './globals.css'

export default function RootLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <html>
      <head>
      </head>
      <body className={className}>
        {children}
      </body>
    </html>
  )
}
