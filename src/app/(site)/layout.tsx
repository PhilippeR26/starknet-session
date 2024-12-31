import { StarknetProvider } from '@/app/(site)/components/client/Starknet-provider';
import './globals.css';
import { Provider } from "@/components/ui/provider";

export const metadata = {
  title: 'Starknet-Sessions',
  description: 'Demo of Starknet sessions',
  icons: {
    icon: "./favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <StarknetProvider>
            {children}
          </StarknetProvider>
        </Provider>
      </body>
    </html>
  )
}
