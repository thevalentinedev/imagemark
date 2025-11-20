import type { FAQItem } from '@/data/faq'

/**
 * Format Conversion-specific FAQ data
 * Tailored questions and answers for the format conversion feature
 */
export const CONVERT_FAQ_DATA: FAQItem[] = [
  {
    id: 'convert-supported-formats',
    question: 'What formats can I convert to?',
    answer:
      'You can convert images to JPEG, PNG, WebP, AVIF, and GIF formats. All major image formats are supported as input, and you can convert between any of these formats.',
  },
  {
    id: 'convert-which-format',
    question: 'Which format should I choose?',
    answer:
      'JPEG is best for photos. PNG supports transparency. WebP offers great compression for web use. AVIF provides the best compression with modern browser support. GIF is ideal for animated images. Choose based on your needs!',
  },
  {
    id: 'convert-multiple-files',
    question: 'Can I convert multiple images at once?',
    answer:
      'Yes! Upload multiple images and convert them all at once. You can select a different target format for each image, or convert all to the same format. Download individually or all at once.',
  },
  {
    id: 'convert-file-size',
    question: 'Will conversion reduce file size?',
    answer:
      'It depends on the format! Converting to WebP or AVIF typically reduces file size significantly (often 25-50% smaller) while maintaining quality. JPEG to PNG may increase size. We show you the file size comparison before download.',
  },
  {
    id: 'convert-quality',
    question: 'Will conversion reduce image quality?',
    answer:
      'Modern formats like WebP and AVIF can actually maintain or improve quality while reducing file size. We use high-quality conversion algorithms to ensure your images look great in any format.',
  },
  {
    id: 'convert-thumbnails',
    question: "Why don't converted images show thumbnails?",
    answer:
      'Some operating systems need time to generate thumbnails for new formats. The images are correctly converted and will open properly. Thumbnails should appear after a few moments or when you refresh your file manager.',
  },
  {
    id: 'convert-privacy',
    question: 'Is my data private?',
    answer:
      "Absolutely! All format conversion happens entirely in your browser - your files never leave your device. We don't store, upload, or access your images. Your privacy is our top priority.",
  },
  {
    id: 'convert-free',
    question: 'Is format conversion really free?',
    answer:
      'Yes! Format conversion is 100% free with no hidden costs, subscriptions, or usage limits. You can convert as many images as you want, completely free. No account required!',
  },
]
