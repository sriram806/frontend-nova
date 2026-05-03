import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/career'],
        disallow: ['/dashboard', '/studio', '/tools', '/history', '/workspaces', '/settings', '/auth'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
