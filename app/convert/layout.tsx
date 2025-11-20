import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/common'

export const metadata: Metadata = {
  title: 'Convert Image Format Online Free | ImageMark',
  description:
    'Convert images between formats (JPEG, PNG, WebP, AVIF, GIF) for free. Modern web formats, transparency support, and maximum compression.',
  keywords: [
    'convert image format',
    'jpeg to png',
    'png to webp',
    'image converter',
    'webp converter',
    'avif converter',
    'format conversion',
    'free image converter',
  ],
  openGraph: {
    title: 'Convert Image Format Online Free | ImageMark',
    description:
      'Convert images between formats (JPEG, PNG, WebP, AVIF, GIF) for free. Modern web formats, transparency support, and maximum compression.',
    url: 'https://imagemark.app/convert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert Image Format Online Free | ImageMark',
    description:
      'Convert images between formats (JPEG, PNG, WebP, AVIF, GIF) for free. Modern web formats, transparency support, and maximum compression.',
  },
}

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
