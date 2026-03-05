import { useEffect } from 'react';

export function PwaMeta() {
  useEffect(() => {
    const manifest = {
      name: "Yes-Pillow",
      short_name: "Yes-Pillow",
      description: "A private connection app for couples.",
      display: "standalone",
      background_color: "#fdfbf7",
      theme_color: "#fdfbf7",
      icons: [
        {
          src: "/favicon.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/favicon.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'manifest');
      document.head.appendChild(link);
    }
    link.setAttribute('href', manifestURL);

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    metaTheme.setAttribute('content', isDark ? '#1a1b26' : '#fdfbf7');

    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, []);

  return null;
}
