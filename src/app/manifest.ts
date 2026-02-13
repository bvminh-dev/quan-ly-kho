import type { MetadataRoute } from 'next';
 
export default function manifest(): MetadataRoute.Manifest {
  
 return {
    name: 'Quản Lý Kho - Warehouse Management',
    short_name: 'Quản Lý Kho',
    description: 'Hệ thống quản lý kho hàng hiện đại',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['business', 'productivity'],
    lang: 'vi',
    dir: 'ltr',
  };
}



