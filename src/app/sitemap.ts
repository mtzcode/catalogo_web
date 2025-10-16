import type { MetadataRoute } from 'next'
import { fetchCategories } from '@/lib/api'
import fs from 'fs'
import path from 'path'

export const revalidate = 3600

function getBrandingSiteUrl(): string | undefined {
  try {
    const brandingPath = path.join(process.cwd(), 'branding.json')
    const buf = fs.readFileSync(brandingPath, 'utf-8')
    const json = JSON.parse(buf || '{}')
    return typeof json.siteUrl === 'string' ? json.siteUrl : undefined
  } catch {
    return undefined
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBrandingSiteUrl() || 'http://localhost:3012'
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/ofertas`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
  ]
  try {
    const cats = await fetchCategories()
    for (const c of cats) {
      routes.push({ url: `${base}/categoria/${encodeURIComponent(c)}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 })
    }
  } catch {}
  return routes
}