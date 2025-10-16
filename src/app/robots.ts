import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

function getBrandingSiteUrl(): string | undefined {
  try {
    const brandingPath = path.join(process.cwd(), 'branding.json');
    const buf = fs.readFileSync(brandingPath, 'utf-8');
    const json = JSON.parse(buf || '{}');
    return typeof json.siteUrl === 'string' ? json.siteUrl : undefined;
  } catch {
    return undefined;
  }
}

export default function robots(): MetadataRoute.Robots {
  const base = getBrandingSiteUrl() || 'http://localhost:3013';
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}