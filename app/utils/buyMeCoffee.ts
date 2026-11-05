// The website's "Buy me a coffee" links. The Buy Me a Coffee widget script used to load
// on every page (hidden) just so these could open its popup; it cost every visitor its
// script and CPU (search plan L3), so the page opens in a new tab instead
export const BUY_ME_COFFEE_URL = 'https://buymeacoffee.com/dhorne92E'

export function openBuyMeCoffee(): void {
	if (!import.meta.client) return
	window.open(BUY_ME_COFFEE_URL, '_blank', 'noopener')
}
