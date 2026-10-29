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

	// Up to yesterday: today's answer page doesn't exist until midnight
	while (cursor < today) {
		const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
		solutionUrls.push(iso)
		cursor.setDate(cursor.getDate() + 1)
	}

	const latestISO = solutionUrls[solutionUrls.length - 1]

	const urlEntries = [
		`  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/play/daily</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/play/scout-report</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/play/spot-the-baller</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/play/grid</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
		// The game pages (pages/games/[mode].vue)
		...['guess-the-footballer', 'football-grid-game', 'guess-the-player-by-price', 'name-the-player'].map(
			(g) => `  <url>
    <loc>${BASE_URL}/games/${g}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
		),
		`  <url>
    <loc>${BASE_URL}/answers</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/how-to-play</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
		`  <url>
    <loc>${BASE_URL}/privacy-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`,
		// Yesterday's answer is the freshest, so it ranks highest
		latestISO
			? `  <url>
    <loc>${BASE_URL}/solution/${latestISO}</loc>
    <lastmod>${latestISO}</lastmod>
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
