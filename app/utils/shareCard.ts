// Share cards (1.3): a picture sent with every result share, drawn from the share text
// itself (composables/useShare.ts), so the card always matches the text. A result card
// (1080 × 1080) for one game, or a Matchday story card (1080 × 1920) once all three daily
// games are done. Spoiler-free (tiles and dots, never letters) and always in Floodlights,
// whatever theme is on. Design: https://claude.ai/artifact/AAqhuxL3LbkAPc1vAn4xn8

export type CardMode = 'daily' | 'scout' | 'spot' | 'grid'
export type CardTile = 'g' | 'a' | 'x'

export interface CardSection {
	mode: CardMode
	/** "3/6", "8/10", "700/900", "2,750" */
	score: string
	rows?: CardTile[][]
	dots?: boolean[]
	/** Under the score on the Matchday card, e.g. "of 4,500 points" */
	note?: string
	/** "Practice", "Week of 2 Nov" */
	sub?: string
}

export interface ShareCardData {
	kind: 'result' | 'matchday'
	/** "#212" when there's a puzzle number */
	number?: string
	streak?: number
	/** Played with high-contrast tiles (orange and blue) */
	highContrast: boolean
	sections: CardSection[]
}

const TILES: Record<string, CardTile> = { '🟩': 'g', '🟧': 'g', '🟨': 'a', '🟦': 'a', '⬛': 'x' }
const DOTS: Record<string, boolean> = { '🟢': true, '🟠': true, '🔴': false, '⚫': false }

const tileRow = (line: string): CardTile[] | null => {
	const cells = Array.from(line.trim())
	return cells.length && cells.every(c => c in TILES) ? cells.map(c => TILES[c]!) : null
}
const dotRow = (line: string): boolean[] | null => {
	const cells = Array.from(line.trim())
	return cells.length && cells.every(c => c in DOTS) ? cells.map(c => DOTS[c]!) : null
}
const tileRows = (lines: string[]) => lines.map(tileRow).filter((r): r is CardTile[] => !!r)

/** Reads a share text (useShare's formats, or the Grid page's) back into card data.
 *  Null for anything else, which is then shared as text only. */
export function parseShareText(text: string): ShareCardData | null {
	const lines = text.split('\n')
	const head = lines[0] ?? ''
	const highContrast = /[🟧🟦🟠⚫]/u.test(text)
	const streakOf = (s: string) => Number(s.match(/🔥 (\d+) day streak/)?.[1]) || undefined
	const scoreOf = (s: string) => s.split(' 🔥')[0]!.trim()
	const numberOf = (s: string) => s.match(/#(\d+)/)?.[0]

	if (head.startsWith('Footballdle Matchday')) {
		const sections: CardSection[] = []
		const blocks = text.split('\n\n').slice(1)
		for (const block of blocks) {
			const [first = '', ...rest] = block.split('\n')
			let m: RegExpMatchArray | null
			if ((m = first.match(/^⚽ Daily (\S+)/))) sections.push({ mode: 'daily', score: m[1]!, rows: tileRows(rest) })
			else if ((m = first.match(/^🔎 Scout Report (\S+)/))) sections.push({ mode: 'scout', score: m[1]!, rows: tileRows(rest) })
			else if ((m = first.match(/^👀 Spot the Baller (\S+)/))) sections.push({ mode: 'spot', score: m[1]!, dots: dotRow(rest[0] ?? '') ?? [] })
			else if ((m = first.match(/^🧩 Grid Week ([\d,]+) \/ ([\d,]+)/))) sections.push({ mode: 'grid', score: m[1]!, note: `of ${m[2]} points` })
		}
		if (!sections.length) return null
		return { kind: 'matchday', number: numberOf(head), streak: Number(head.match(/(\d+) day Matchday streak/)?.[1]) || undefined, highContrast, sections }
	}

	const second = lines[1] ?? ''
	const body = lines.slice(2)
	const result = (section: CardSection): ShareCardData => ({ kind: 'result', number: numberOf(head), streak: streakOf(second), highContrast, sections: [section] })
	if (head.startsWith('Footballdle ⚽')) return result({ mode: 'daily', score: scoreOf(second), rows: tileRows(body) })
	if (head.startsWith('Footballdle Scout Report')) return result({ mode: 'scout', score: scoreOf(second), rows: tileRows(body) })
	if (head.startsWith('Footballdle Spot the Baller')) return result({ mode: 'spot', score: scoreOf(second), dots: body.map(dotRow).find(Boolean) ?? [] })
	if (head.startsWith('Footballdle The Grid')) {
		const practice = head.includes('(practice)')
		const week = head.match(/week of ([^·]+)/)?.[1]?.trim()
		// A week share has one row of nine per grid ("1 🟩🟩… 900"); a single grid, three rows of three
		const weekShare = !practice && !head.includes('· grid')
		const rows = weekShare
			? body.map(l => tileRow(l.replace(/^\d+ /, '').replace(/ [\d,]+$/, ''))).filter((r): r is CardTile[] => !!r)
			: tileRows(body)
		const [points = '', total] = scoreOf(second).split('/')
		return {
			kind: 'result',
			highContrast,
			sections: [{ mode: 'grid', score: points, rows, sub: practice ? 'Practice' : week ? `Week of ${week}` : undefined, note: total ? `of ${total} points` : undefined }],
		}
	}
	return null
}

// ------------------------------------------------------------------- drawing

const C = {
	bg: '#07130d',
	bg2: '#0f2219',
	text: '#eaf5ee',
	text2: '#8fa89a',
	green: '#2fe08a',
	amber: '#f2b84b',
	absent: '#24352d',
	miss: '#ff8a80',
	onPresent: '#1b1203',
}
// The game colours (--game-* in _app-shell.scss)
const MODE: Record<CardMode, { name: string; colour: string }> = {
	daily: { name: 'Daily', colour: '#2fe08a' },
	scout: { name: 'Scout Report', colour: '#6ea8ff' },
	spot: { name: 'Spot the Baller', colour: '#b49bff' },
	grid: { name: 'The Grid', colour: '#f47fd2' },
}
const HEAD = "Jost, Futura, 'Avenir Next', sans-serif"
const BODY = "Inter, -apple-system, 'Helvetica Neue', sans-serif"

function tileColours(hc: boolean) {
	return hc ? { g: '#f5793a', a: '#85c0f9', x: C.absent, hit: '#f5793a', miss: '#4a5550' } : { g: C.green, a: C.amber, x: C.absent, hit: C.green, miss: C.miss }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath()
	ctx.roundRect(x, y, w, h, r)
}

function drawTiles(ctx: CanvasRenderingContext2D, rows: CardTile[][], x: number, y: number, maxW: number, maxH: number, maxSize: number, hc: boolean) {
	const cols = Math.max(...rows.map(r => r.length), 1)
	const gap = Math.max(4, Math.round(maxSize * 0.18))
	const size = Math.min(maxSize, (maxW - gap * (cols - 1)) / cols, (maxH - gap * (rows.length - 1)) / Math.max(rows.length, 1))
	const colours = tileColours(hc)
	rows.forEach((row, ri) =>
		row.forEach((t, ci) => {
			const tx = x + ci * (size + gap)
			const ty = y + ri * (size + gap)
			ctx.fillStyle = colours[t]
			roundRect(ctx, tx, ty, size, size, size * 0.16)
			ctx.fill()
			// Close tiles carry a dot, as on the board, so colour isn't the only signal
			if (t === 'a') {
				ctx.fillStyle = 'rgb(27 18 3 / 55%)'
				ctx.beginPath()
				ctx.arc(tx + size * 0.72, ty + size * 0.28, size * 0.1, 0, Math.PI * 2)
				ctx.fill()
			}
		}),
	)
	return { w: cols * size + (cols - 1) * gap, h: rows.length * size + (rows.length - 1) * gap }
}

function drawDots(ctx: CanvasRenderingContext2D, dots: boolean[], x: number, y: number, r: number, perRow: number, hc: boolean) {
	const colours = tileColours(hc)
	const gap = r * 0.9
	dots.forEach((hit, i) => {
		const cx = x + r + (i % perRow) * (2 * r + gap)
		const cy = y + r + Math.floor(i / perRow) * (2 * r + gap)
		ctx.fillStyle = hit ? colours.hit : colours.miss
		ctx.beginPath()
		ctx.arc(cx, cy, r, 0, Math.PI * 2)
		ctx.fill()
		// A miss also gets a cross, so colour isn't the only signal
		if (!hit) {
			const k = r * 0.38
			ctx.strokeStyle = 'rgb(7 19 13 / 70%)'
			ctx.lineWidth = Math.max(2, r * 0.22)
			ctx.lineCap = 'round'
			ctx.beginPath()
			ctx.moveTo(cx - k, cy - k)
			ctx.lineTo(cx + k, cy + k)
			ctx.moveTo(cx + k, cy - k)
			ctx.lineTo(cx - k, cy + k)
			ctx.stroke()
		}
	})
	const rows = Math.ceil(dots.length / perRow)
	return { w: Math.min(dots.length, perRow) * (2 * r + gap) - gap, h: rows * (2 * r + gap) - gap }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
	ctx.fillStyle = C.bg
	ctx.fillRect(0, 0, w, h)
	const glow = ctx.createRadialGradient(w / 2, -h * 0.05, 0, w / 2, -h * 0.05, w * 0.9)
	glow.addColorStop(0, 'rgb(47 224 138 / 24%)')
	glow.addColorStop(1, 'rgb(47 224 138 / 0%)')
	ctx.fillStyle = glow
	ctx.fillRect(0, 0, w, h)
}

function drawBrand(ctx: CanvasRenderingContext2D, x: number, y: number, right: string, w: number) {
	ctx.strokeStyle = C.green
	ctx.lineWidth = 9
	ctx.beginPath()
	ctx.arc(x + 46, y + 46, 41, 0, Math.PI * 2)
	ctx.stroke()
	ctx.fillStyle = C.green
	ctx.font = `800 52px ${HEAD}`
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText('F', x + 46, y + 49)
	ctx.fillStyle = C.text
	ctx.textAlign = 'left'
	ctx.font = `700 58px ${HEAD}`
	ctx.fillText('Footballdle', x + 118, y + 48)
	ctx.fillStyle = C.text2
	ctx.textAlign = 'right'
	ctx.font = `600 34px ${BODY}`
	ctx.fillText(right.toUpperCase(), w - x, y + 48)
	ctx.textAlign = 'left'
}

function drawModeLabel(ctx: CanvasRenderingContext2D, mode: CardMode, x: number, y: number, size: number, extra = '') {
	const { name, colour } = MODE[mode]
	ctx.fillStyle = colour
	ctx.beginPath()
	ctx.arc(x + size * 0.32, y, size * 0.32, 0, Math.PI * 2)
	ctx.fill()
	ctx.font = `700 ${size}px ${BODY}`
	ctx.textBaseline = 'middle'
	ctx.letterSpacing = `${size * 0.1}px`
	ctx.fillText((name + extra).toUpperCase(), x + size * 1.05, y + 1)
	ctx.letterSpacing = '0px'
}

function drawScore(ctx: CanvasRenderingContext2D, score: string, x: number, y: number, size: number) {
	const [main = score, rest] = score.split('/')
	ctx.textBaseline = 'alphabetic'
	ctx.fillStyle = C.text
	ctx.font = `800 ${size}px ${HEAD}`
	ctx.fillText(main, x, y)
	if (rest !== undefined) {
		const w = ctx.measureText(main).width
		ctx.fillStyle = C.text2
		ctx.font = `600 ${size * 0.5}px ${HEAD}`
		ctx.fillText(`/${rest}`, x + w + size * 0.04, y)
	}
}

function drawStorePill(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, h: number, alignRight: boolean, fullW?: number) {
	ctx.font = `700 ${h * 0.4}px ${BODY}`
	const w = fullW ?? ctx.measureText(label).width + h * 0.9
	const left = alignRight ? x - w : x
	ctx.fillStyle = C.text
	roundRect(ctx, left, y, w, h, h * 0.24)
	ctx.fill()
	ctx.fillStyle = C.bg
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText(label, left + w / 2, y + h / 2 + 1)
	ctx.textAlign = 'left'
}

const challengeLine = (s: CardSection) => {
	const [n] = s.score.split('/')
	if (n === 'X' || n === '0') return 'Can you get it?'
	return `Can you beat ${n}?`
}

function today() {
	return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' })
}

function drawResult(ctx: CanvasRenderingContext2D, d: ShareCardData) {
	const W = 1080
	const s = d.sections[0]!
	drawBackground(ctx, W, W)
	drawBrand(ctx, 80, 72, [d.number ?? s.sub, today()].filter(Boolean).join(' · '), W)

	// Left: game, score, streak. Right: the board, spoiler-free
	drawModeLabel(ctx, s.mode, 80, 330, 38)
	drawScore(ctx, s.score, 76, 560, 190)
	if (s.note) {
		ctx.fillStyle = C.text2
		ctx.font = `600 40px ${BODY}`
		ctx.fillText(s.note, 82, 630)
	} else if (d.streak && d.streak > 1) {
		ctx.fillStyle = C.amber
		ctx.font = `600 44px ${BODY}`
		ctx.fillText(`🔥 ${d.streak} day streak`, 82, 640)
	}
	const boxX = 560, boxY = 280, boxW = 440, boxH = 470
	if (s.rows?.length) {
		const maxSize = s.mode === 'grid' && s.rows[0]!.length === 3 ? 112 : 78
		const probe = document.createElement('canvas').getContext('2d')!
		const size = drawTiles(probe, s.rows, 0, 0, boxW, boxH, maxSize, d.highContrast)
		drawTiles(ctx, s.rows, boxX + (boxW - size.w) / 2, boxY + (boxH - size.h) / 2, boxW, boxH, maxSize, d.highContrast)
	} else if (s.dots?.length) {
		const perRow = 5, r = 34
		const w = perRow * 2 * r + (perRow - 1) * r * 0.9
		const rows = Math.ceil(s.dots.length / perRow)
		const h = rows * 2 * r + (rows - 1) * r * 0.9
		drawDots(ctx, s.dots, boxX + (boxW - w) / 2, boxY + (boxH - h) / 2, r, perRow, d.highContrast)
	}

	// Footer: the challenge and the link
	ctx.textBaseline = 'alphabetic'
	ctx.fillStyle = C.text
	ctx.font = `700 46px ${BODY}`
	ctx.fillText(challengeLine(s), 80, 935)
	ctx.fillStyle = C.text2
	ctx.font = `500 38px ${BODY}`
	ctx.fillText('footballdle.co.uk/app', 80, 990)
	drawStorePill(ctx, 'Free on the App Store', W - 80, 905, 96, true)
}

function drawMatchday(ctx: CanvasRenderingContext2D, d: ShareCardData) {
	const W = 1080, H = 1920, X = 80, CW = W - 2 * X
	drawBackground(ctx, W, H)
	// Clear of Instagram's own top bar and bottom reply bar
	drawBrand(ctx, X, 150, today(), W)
	ctx.textBaseline = 'alphabetic'
	ctx.fillStyle = C.text2
	ctx.font = `600 36px ${BODY}`
	ctx.letterSpacing = '4px'
	ctx.fillText(`MATCHDAY${d.number ? ` ${d.number}` : ''}`, X, 330)
	ctx.letterSpacing = '0px'
	ctx.fillStyle = C.text
	ctx.font = `800 108px ${HEAD}`
	ctx.fillText('All three done', X - 4, 438)

	// Each game's panel: label and score on the left, its board on the right. Tiles shrink
	// until every panel fits above the streak, however many guesses there were
	const top = 486, bottom = 1300, gap = 22, minH = 170
	const probe = document.createElement('canvas').getContext('2d')!
	let tile = 36
	const heights = () => d.sections.map(s => Math.max(minH, s.rows?.length ? drawTiles(probe, s.rows, 0, 0, 400, 400, tile, d.highContrast).h + 64 : 0))
	while (tile > 16 && heights().reduce((a, b) => a + b, 0) + gap * (d.sections.length - 1) > bottom - top) tile -= 2
	const hs = heights()
	let y = top
	d.sections.forEach((s, i) => {
		const h = hs[i]!
		ctx.fillStyle = C.bg2
		roundRect(ctx, X, y, CW, h, 32)
		ctx.fill()
		ctx.fillStyle = MODE[s.mode].colour
		roundRect(ctx, X, y, 12, h, 6)
		ctx.fill()
		drawModeLabel(ctx, s.mode, X + 44, y + 48, 28, s.mode === 'grid' ? ' Week' : '')
		drawScore(ctx, s.score, X + 44, y + h - 30, 72)
		if (s.note) {
			ctx.fillStyle = C.text2
			ctx.font = `500 32px ${BODY}`
			ctx.textAlign = 'right'
			ctx.textBaseline = 'alphabetic'
			ctx.fillText(s.note, X + CW - 44, y + h - 36)
			ctx.textAlign = 'left'
		}
		if (s.rows?.length) {
			const size = drawTiles(probe, s.rows, 0, 0, 400, 400, tile, d.highContrast)
			drawTiles(ctx, s.rows, X + CW - 44 - size.w, y + (h - size.h) / 2, 400, 400, tile, d.highContrast)
		}
		if (s.dots?.length) {
			const r = 15, w = s.dots.length * 2 * r + (s.dots.length - 1) * r * 0.9
			drawDots(ctx, s.dots, X + CW - 44 - w, y + h - 30 - 2 * r - 6, r, 10, d.highContrast)
		}
		y += h + gap
	})
	y = bottom + 30

	// The Matchday streak ring
	if (d.streak && d.streak > 0) {
		ctx.strokeStyle = C.green
		ctx.lineWidth = 14
		ctx.beginPath()
		ctx.arc(X + 60, y + 60, 53, 0, Math.PI * 2)
		ctx.stroke()
		ctx.fillStyle = C.text
		ctx.font = `800 50px ${HEAD}`
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(String(d.streak), X + 60, y + 63)
		ctx.textAlign = 'left'
		ctx.font = `700 42px ${BODY}`
		ctx.fillText(`${d.streak} day Matchday streak`, X + 150, y + 44)
		ctx.fillStyle = C.text2
		ctx.font = `500 34px ${BODY}`
		ctx.fillText('Every daily game, every day', X + 150, y + 92)
	}

	ctx.fillStyle = C.text
	ctx.font = `700 52px ${HEAD}`
	ctx.textAlign = 'center'
	ctx.textBaseline = 'alphabetic'
	ctx.fillText('Think you know your footballers?', W / 2, 1512)
	ctx.textAlign = 'left'
	// Clear of Instagram's reply bar along the bottom
	drawStorePill(ctx, 'footballdle.co.uk/app · Free on the App Store', X, 1546, 100, false, CW)
}

/** Draws the card for a share text: a base64 PNG (no data: prefix), or null when the
 *  text has no card or drawing isn't possible */
export async function drawShareCard(text: string): Promise<string | null> {
	const data = parseShareText(text)
	if (!data || typeof document === 'undefined') return null
	try {
		await Promise.race([
			Promise.all([`800 100px Jost`, `700 50px Jost`, `700 40px Inter`, `500 40px Inter`].map(f => document.fonts.load(f))),
			new Promise(r => setTimeout(r, 1500)),
		])
	} catch {}
	const canvas = document.createElement('canvas')
	canvas.width = 1080
	canvas.height = data.kind === 'matchday' ? 1920 : 1080
	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	if (data.kind === 'matchday') drawMatchday(ctx, data)
	else drawResult(ctx, data)
	return canvas.toDataURL('image/png').split(',')[1] ?? null
}
