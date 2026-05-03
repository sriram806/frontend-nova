import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/career`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];
}
