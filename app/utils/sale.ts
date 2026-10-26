// Flash sales. The price itself is scheduled in App Store Connect (no app update); this
// only labels it. app-config.json on the website carries, while a sale is on:
//
//   "sale": {
//     "until": "2026-12-28T23:59:59Z",
//     "regular": { "pro": { "GBP": 9.99, "USD": 9.99, "EUR": 9.99 } }
//   }
//
// `regular` is each product's normal price in each currency (App Store Connect's
// automatic prices for the territories). A product is only labelled when its App Store
// price, in the player's currency, really is below that, so the label can't claim a sale
// that isn't on: no currency listed, a sale that's ended, or a price that's gone back
// up all show nothing.

export interface SaleConfig {
	until: string
	regular: Record<string, Record<string, number>>
}

export interface SaleLabel {
	/** The normal price, formatted for the player's currency */
	was: string
}

interface PricedProduct {
	identifier: string
	price: number
	currencyCode: string
}

export function readSaleConfig(raw: unknown): SaleConfig | null {
	if (!raw || typeof raw !== 'object') return null
	const { until, regular } = raw as Record<string, unknown>
	if (typeof until !== 'string' || Number.isNaN(Date.parse(until))) return null
	if (!regular || typeof regular !== 'object') return null
	return { until, regular: regular as SaleConfig['regular'] }
}

export function saleFor(product: PricedProduct | undefined, sale: SaleConfig | null, now = Date.now()): SaleLabel | null {
	if (!product || !sale || now >= Date.parse(sale.until)) return null
	const normal = sale.regular[product.identifier]?.[product.currencyCode]
	if (typeof normal !== 'number' || !(product.price < normal - 0.001)) return null
	try {
		return { was: new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currencyCode }).format(normal) }
	} catch {
		return null
	}
}
