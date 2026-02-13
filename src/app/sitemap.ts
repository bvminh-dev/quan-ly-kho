import { navigationConfig } from '@/config/navigation.config';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = navigationConfig
    .filter((item) => item.url !== '#' && !item.comingSoon)
    .map((item) => ({
      url: `${baseUrl}${item.url}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: item.url === '/dashboard' ? 0.9 : 0.7,
    }));

  return [...staticRoutes, ...dynamicRoutes];
}
