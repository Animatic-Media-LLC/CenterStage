import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Raleway,
  Ubuntu,
  Nunito,
  Playfair_Display,
  Merriweather,
  PT_Sans,
  Oswald,
  Source_Sans_3,
  Bebas_Neue,
} from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SnackbarProvider } from '@/components/providers/snackbar-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load all available presentation fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ["latin"], variable: "--font-roboto" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const lato = Lato({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-lato" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ["latin"], variable: "--font-poppins" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const ubuntu = Ubuntu({ weight: ['400', '500', '700'], subsets: ["latin"], variable: "--font-ubuntu" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-merriweather" });
const ptSans = PT_Sans({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-pt-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans-pro" });
const bebasNeue = Bebas_Neue({ weight: ['400'], subsets: ["latin"], variable: "--font-bebas-neue" });

export const metadata: Metadata = {
  title: "CenterStage - Admin Dashboard",
  description: "Manage CenterStage projects and submissions",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${raleway.variable} ${ubuntu.variable} ${nunito.variable} ${playfairDisplay.variable} ${merriweather.variable} ${ptSans.variable} ${oswald.variable} ${sourceSans.variable} ${bebasNeue.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
