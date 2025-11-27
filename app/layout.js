// import { WebVitals } from "@/components/web-vitals";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAMeta from "@/components/PWAMeta";
import EmotionRegistry from "./EmotionRegistry";


export const metadata = {
  title: "The Hear",
  description: "A non-profit news observatory and archive",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Hear"
  },
  openGraph: {
    title: "The Hear",
    description: "A non-profit news observatory and archive",
    url: "https://www.thehear.org/",
    siteName: "The Hear",
    images: [
      {
        url: "https://www.thehear.org/logo192.png",
        width: 192,
        height: 192,
        alt: "The Hear logo",
      },
      {
        url: "https://www.thehear.org/logo512.png",
        width: 512,
        height: 512,
        alt: "The Hear logo large",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Hear",
    description: "A non-profit news observatory and archive",
    images: ["https://www.thehear.org/logo512.png"],
    site: "@thehearnews"
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any", type: "image/x-icon" }
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000"
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <PWAMeta />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://www.thehear.org",
              "logo": "https://www.thehear.org/RoundLogo-S.png"
            })
          }}
        />
      </head>
      <body>
        <EmotionRegistry options={{ key: 'mui' }}>
          <Analytics />
          <GoogleAnalytics />
          <SpeedInsights />
          <ServiceWorkerRegistration />
          {/* <WebVitals /> */}
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
