import { siteDocumentSchema } from "../../shared/site-content";
import type { SiteDocument } from "../../shared/site-content";

const key = "anjos3d.cms.published";
/** Only public, published content is stored here. Never call this from draft preview. */
export function readPublishedCache(): SiteDocument | null {
  try {
    const value = sessionStorage.getItem(key);
    if (!value) return null;
    const result = siteDocumentSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch { return null; }
}
export function cachePublishedContent(document: SiteDocument) {
  try { sessionStorage.setItem(key, JSON.stringify(document)); } catch { /* Rendering still works without cache. */ }
}