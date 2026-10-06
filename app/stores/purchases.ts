import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import type { CustomerInfo, PurchasesStoreProduct } from '@revenuecat/purchases-capacitor'
import { HINT_PACKS, PRO_ENTITLEMENT, PRODUCT_IDS, TIP_PRODUCT_IDS } from '../utils/appStore'

// Cached so Pro perks still work offline / before RevenueCat answers
const PRO_CACHE_KEY = 'footballdle-pro'
// Bought-but-unused hints. Consumables can't be restored by Apple, so the bank
// lives on the device.
const HINT_BANK_KEY = 'footballdle-hint-bank'
// Everyone starts the app with a few free hints, given once per install
const WELCOME_HINTS = 3
const WELCOME_HINTS_KEY = 'footballdle-welcome-hints'

function readHintBank(): number {
	if (!import.meta.client) return 0
	try {
		return Math.max(0, Number.parseInt(localStorage.getItem(HINT_BANK_KEY) || '0', 10) || 0)
	} catch {
		return 0
	}
}

// In-app purchases for the iOS app via RevenueCat. Inert on the website.
export const usePurchasesStore = defineStore('purchases', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const isReady = ref(false)
	const isPro = ref(false)
	const products = ref<PurchasesStoreProduct[]>([])
	const busy = ref(false)
	const message = ref('')
	const hintBank = ref(readHintBank())
	// Read once while the store is created: later calls (e.g. a retry from a watcher)
	// run outside the Nuxt context, where useRuntimeConfig() throws
	const { isApp, revenuecatAppleKey } = useRuntimeConfig().public
	// Why products didn't load, shown in the hint shop so failures aren't a mystery
	const loadError = ref('')

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const proProduct = computed(() => products.value.find(p => p.identifier === PRODUCT_IDS.pro))

	const tipProducts = computed(() =>
		TIP_PRODUCT_IDS.map(id => products.value.find(p => p.identifier === id)).filter(
			(p): p is PurchasesStoreProduct => !!p,
		),
	)

	const hintPacks = computed(() =>
		HINT_PACKS.map(pack => ({ ...pack, product: products.value.find(p => p.identifier === pack.id) })).filter(
			(pack): pack is (typeof HINT_PACKS)[number] & { product: PurchasesStoreProduct } => !!pack.product,
		),
	)

	// ============================================================================
	// FUNCTIONS
	// ============================================================================
	function grantWelcomeHints() {
		if (!import.meta.client || !isApp) return
		try {
			if (localStorage.getItem(WELCOME_HINTS_KEY)) return
			localStorage.setItem(WELCOME_HINTS_KEY, '1')
		} catch {
			return
		}
		hintBank.value += WELCOME_HINTS
		saveHintBank()
	}

	function saveHintBank() {
		try {
			localStorage.setItem(HINT_BANK_KEY, String(hintBank.value))
		} catch {}
	}

	async function buyHints(pack: { product: PurchasesStoreProduct; count: number }) {
		const ok = await purchase(pack.product)
		if (ok) {
			hintBank.value += pack.count
			saveHintBank()
			message.value = pack.count === 1 ? 'Hint added.' : `${pack.count} hints added.`
		}
		return ok
	}

	/** Free hints, e.g. streak rewards, go into the same bank as bought ones */
	function grantHints(count: number) {
		hintBank.value += count
		saveHintBank()
	}

	/** Spends a hint: free with Pro, otherwise one from the bank. False if none left. */
	function spendHint(): boolean {
		if (isPro.value) return true
		if (hintBank.value <= 0) return false
		hintBank.value--
		saveHintBank()
		return true
	}
	async function getSdk() {
		return (await import('@revenuecat/purchases-capacitor')).Purchases
	}

	function applyCustomerInfo(info: CustomerInfo) {
		isPro.value = !!info.entitlements.active[PRO_ENTITLEMENT]
		try {
			localStorage.setItem(PRO_CACHE_KEY, isPro.value ? '1' : '0')
		} catch {}
	}

	let configured = false
	let loading = false

	/** Sets up RevenueCat once, then (re)loads products; safe to call again to retry */
	async function init() {
		grantWelcomeHints()
		if (!Capacitor.isNativePlatform()) return
		const apiKey = revenuecatAppleKey
		if (!apiKey) {
			loadError.value = 'Purchases aren\'t set up in this build.'
			return
		}

		if (loading) return
		loading = true
		let stage = 'starting purchases'
		loadError.value = 'Connecting to the App Store…'
		const timeout = setTimeout(() => {
			if (loading) loadError.value = `No response while ${stage}.`
		}, 15000)

		try {
			const Purchases = await getSdk()
			if (!configured) {
				try {
					isPro.value = localStorage.getItem(PRO_CACHE_KEY) === '1'
				} catch {}
				stage = 'configuring RevenueCat'
				await Purchases.configure({ apiKey })
				await Purchases.addCustomerInfoUpdateListener(applyCustomerInfo)
				configured = true
				// Pro status arrives on its own; products don't wait for it
				Purchases.getCustomerInfo()
					.then(({ customerInfo }) => applyCustomerInfo(customerInfo))
					.catch(() => {})
			}
			stage = 'loading products'
			const result = await Purchases.getProducts({ productIdentifiers: Object.values(PRODUCT_IDS) })
			products.value = result.products
			isReady.value = result.products.length > 0
			const known = new Set<string>(Object.values(PRODUCT_IDS))
			const matched = result.products.filter(p => known.has(p.identifier)).length
			loadError.value = !result.products.length
				? 'The App Store returned no products.'
				: matched
					? ''
					: `Unexpected products: ${result.products.map(p => p.identifier).join(', ')}`
		} catch (error: any) {
			loadError.value = error?.message ?? String(error)
			console.warn('In-app purchases unavailable:', error)
		} finally {
			loading = false
			clearTimeout(timeout)
		}
	}

	async function purchase(product: PurchasesStoreProduct): Promise<boolean> {
		if (busy.value) return false
		busy.value = true
		message.value = ''
		try {
			const Purchases = await getSdk()
			const { customerInfo } = await Purchases.purchaseStoreProduct({ product })
			applyCustomerInfo(customerInfo)
			return true
		} catch (error: any) {
			const cancelled = error?.code === '1' || error?.userCancelled
			if (!cancelled) message.value = 'Purchase failed. Please try again.'
			return false
		} finally {
			busy.value = false
		}
	}

	async function buyPro() {
		if (!proProduct.value) {
			message.value = 'Pro is unavailable right now. Please try again later.'
			return false
		}
		const ok = await purchase(proProduct.value)
		if (ok) message.value = 'Pro unlocked. Unlimited hints, cheers!'
		return ok
	}

	async function tip(product: PurchasesStoreProduct) {
		const ok = await purchase(product)
		if (ok) message.value = 'Thanks for the support! 🍻'
		return ok
	}

	async function restore() {
		if (busy.value) return
		busy.value = true
		message.value = ''
		try {
			const Purchases = await getSdk()
			const { customerInfo } = await Purchases.restorePurchases()
			applyCustomerInfo(customerInfo)
			message.value = isPro.value ? 'Pro restored.' : 'No previous purchases found.'
		} catch {
			message.value = 'Restore failed. Please try again.'
		} finally {
			busy.value = false
		}
	}

	return {
		// State
		isReady,
		isPro,
		products,
		busy,
		message,
		hintBank,
		loadError,

		// Computed
		proProduct,
		tipProducts,
		hintPacks,

		// Functions
		init,
		buyPro,
		buyHints,
		spendHint,
		grantHints,
		tip,
		restore,
	}
})
