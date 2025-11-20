import type { FAQItem } from '@/data/faq'

/**
 * Background Removal-specific FAQ data
 * Tailored questions and answers for the background removal feature
 */
export const REMOVE_BACKGROUND_FAQ_DATA: FAQItem[] = [
  {
    id: 'background-supported-formats',
    question: 'What file formats are supported?',
    answer:
      'We support JPEG, PNG, GIF, WebP, BMP, TIFF, and SVG for images. For best results with transparent backgrounds, use PNG files. JPG files will have a white background (JPG format does not support transparency).',
  },
  {
    id: 'background-png-vs-jpg',
    question: 'Why do PNG files work better than JPG?',
    answer:
      'PNG format supports transparency, so when we remove the background, you get a transparent background. JPG format does not support transparency, so the removed background is replaced with white. For transparent backgrounds, always use PNG files.',
  },
  {
    id: 'background-multiple-files',
    question: 'Can I process multiple images at once?',
    answer:
      'Yes! You can upload multiple images and process them all at once. Each image is processed independently, and you can download them individually or all at once.',
  },
  {
    id: 'background-file-size',
    question: 'Are there file size limits?',
    answer:
      'For optimal performance, we recommend images under 10MB. Very large files may take longer to process. All processing happens in your browser, so your files never leave your device.',
  },
  {
    id: 'background-how-it-works',
    question: 'How does AI background removal work?',
    answer:
      'Our AI-powered system automatically detects the main subject in your image and removes everything else, creating a clean transparent background. The process is fast, accurate, and preserves fine details like hair and edges.',
  },
  {
    id: 'background-quality',
    question: 'Will background removal reduce image quality?',
    answer:
      'No! We preserve your original image quality while removing the background. The AI processing maintains fine details and edges, ensuring professional results.',
  },
  {
    id: 'background-use-cases',
    question: 'What can I use this for?',
    answer:
      'Background removal is perfect for e-commerce product photos, profile pictures, logo extraction, social media content, creating transparent PNGs, and any situation where you need to isolate a subject from its background.',
  },
  {
    id: 'background-privacy',
    question: 'Is my data private?',
    answer:
      "Absolutely! All background removal processing happens entirely in your browser - your files never leave your device. We don't store, upload, or access your images. Your privacy is our top priority.",
  },
  {
    id: 'background-free',
    question: 'Is background removal really free?',
    answer:
      'Yes! Background removal is 100% free with no hidden costs, subscriptions, or usage limits. You can process as many images as you want, completely free. No account required!',
  },
]
