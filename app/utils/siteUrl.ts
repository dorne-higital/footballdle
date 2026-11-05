// The website's own addresses, as Google should index them. Netlify serves each
// prerendered page at /path/ and redirects /path to it, so canonicals, og:url, JSON-LD
// and the sitemap all name the trailing-slash form (no redirect in between)
export const SITE = 'https://footballdle.co.uk'

export const pageUrl = (path: string): string => (path === '/' ? `${SITE}/` : `${SITE}${path.replace(/\/?$/, '/')}`)
