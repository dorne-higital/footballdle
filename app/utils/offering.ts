// RevenueCat Offering metadata (1.3, plan M3): shop copy that can change from the
// RevenueCat dashboard without an app update. Set on the "default" Offering as JSON:
//   { "banner": "Weekend sale: Pro £6.99", "badges": { "fh15": "Best value" } }
// banner shows at the top of the hint shop and the Pro sheet; badges tag a product by
// its App Store product ID. Anything missing or the wrong type is ignored.
export interface OfferingCopy {
	banner: string
	badges: Record<string, string>
}

const MAX_BANNER = 80
const MAX_BADGE = 20

export function readOfferingMeta(meta: unknown): OfferingCopy {
	const m = meta && typeof meta === 'object' ? (meta as Record<string, unknown>) : {}
	const banner = typeof m.banner === 'string' ? m.banner.trim().slice(0, MAX_BANNER) : ''
	const badges: Record<string, string> = {}
	if (m.badges && typeof m.badges === 'object') {
		for (const [id, label] of Object.entries(m.badges as Record<string, unknown>)) {
			if (typeof label === 'string' && label.trim()) badges[id] = label.trim().slice(0, MAX_BADGE)
		}
	}
	return { banner, badges }
}

/** What every paid theme and the Colour Pack cost bought one by one, in the store's
 *  currency, for the Pro sheet ("worth £8.93 on their own"). Empty unless every one
 *  has a price, so it's never an undercount. */
export function themesWorth(products: { identifier: string; price: number; currencyCode: string }[], themeIds: string[]): string {
	const found = themeIds.map(id => products.find(p => p.identifier === id))
	if (!found.length || found.some(p => !p)) return ''
	const currency = found[0]!.currencyCode
	if (found.some(p => p!.currencyCode !== currency)) return ''
	const total = found.reduce((sum, p) => sum + p!.price, 0)
	try {
		return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(total)
	} catch {
		return ''
	}
}
