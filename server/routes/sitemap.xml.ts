const BASE_URL = 'https://footballdle.co.uk'
const EPOCH = new Date(2026, 0, 1) // 1 Jan 2026 — Puzzle #1

function getUKToday(): Date {
	const s = new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })
	const d = new Date(s)
	d.setHours(0, 0, 0, 0)
	return d
}

export default defineEventHandler((event) => {
	setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
	setHeader(event, 'Cache-Control', 'public, max-age=3600') // refresh hourly

	const today = getUKToday()
	const solutionUrls: string[] = []
	const cursor = new Date(EPOCH)

	while (cursor <= today) {
		const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
		solutionUrls.push(iso)
		cursor.setDate(cursor.getDate() + 1)
	}

	const todayISO = solutionUrls[solutionUrls.length - 1]

	const urlEntries = [
		`  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
		// Today's solution is highest priority — freshest content
		todayISO
			? `  <url>
    <loc>${BASE_URL}/solution/${todayISO}</loc>
    <lastmod>${todayISO}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.9</priority>
  </url>`
			: '',
		// All previous solutions
		...solutionUrls
			.slice(0, -1)
			.reverse()
			.map(
				(iso) => `  <url>
    <loc>${BASE_URL}/solution/${iso}</loc>
    <lastmod>${iso}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>`,
			),
	].filter(Boolean)

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`
})
