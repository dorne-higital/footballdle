import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
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
	// A streak reward to celebrate on the Daily result sheet (separate from shop
	// messages, which only show in the shop and Settings)
	const rewardNote = ref('')
	const hintBank = ref(readHintBank())
	// Read once while the store is created: later calls (e.g. a retry from a watcher)
	// run outside the Nuxt context, where useRuntimeConfig() throws
	const { isApp, revenuecatAppleKey } = useRuntimeConfig().public
	// Why products didn't load, in words a player understands (details go to the console)
	const loadError = ref('')
	const loadingProducts = ref(false)

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
	// Wrapped in an object on purpose: a Capacitor plugin is a Proxy that answers to any
	// method name, including `then`, so returning it straight from an async function
	// makes the promise call Purchases.then() on the native side and never settle
	async function getSdk() {
		const { Purchases } = await import('@revenuecat/purchases-capacitor')
		return { Purchases }
	}

	function applyCustomerInfo(info: CustomerInfo) {
		isPro.value = !!info.entitlements.active[PRO_ENTITLEMENT]
		try {
			localStorage.setItem(PRO_CACHE_KEY, isPro.value ? '1' : '0')
		} catch {}
	}

	const STORE_UNREACHABLE = 'Couldn\'t reach the App Store.'
	const LOAD_TIMEOUT_MS = 15000

	// Gives up on a call that never answers, so a retry is always possible
	function withTimeout<T>(promise: Promise<T>, what: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error(`No response while ${what}`)), LOAD_TIMEOUT_MS)
			promise.then(
				(value) => {
					clearTimeout(timer)
					resolve(value)
				},
				(error) => {
					clearTimeout(timer)
					reject(error)
				},
			)
		})
	}

	// Shared so a retry while configure is still in flight waits for it rather than
	// configuring RevenueCat twice; cleared on failure so the next try starts again
	let configuring: Promise<void> | null = null
	function configure(apiKey: string) {
		configuring ??= (async () => {
			try {
				isPro.value = localStorage.getItem(PRO_CACHE_KEY) === '1'
			} catch {}
			const { Purchases } = await getSdk()
			await Purchases.configure({ apiKey })
			await Purchases.addCustomerInfoUpdateListener(applyCustomerInfo)
			// Pro status arrives on its own; products don't wait for it
			Purchases.getCustomerInfo()
				.then(({ customerInfo }) => applyCustomerInfo(customerInfo))
				.catch(() => {})
		})().catch((error) => {
			configuring = null
			throw error
		})
		return configuring
	}

	/** Sets up RevenueCat once, then (re)loads products; safe to call again to retry */
	async function init() {
		grantWelcomeHints()
		if (!Capacitor.isNativePlatform()) return
		const apiKey = revenuecatAppleKey
		if (!apiKey) {
			loadError.value = 'Purchases aren\'t set up in this build.'
			return
		}

		if (loadingProducts.value) return
		loadingProducts.value = true
		loadError.value = ''
		try {
			await withTimeout(configure(apiKey), 'configuring RevenueCat')
			const { Purchases } = await getSdk()
			const result = await withTimeout(
				Purchases.getProducts({ productIdentifiers: Object.values(PRODUCT_IDS) }),
				'loading products',
			)
			products.value = result.products
			isReady.value = result.products.length > 0
			const known = new Set<string>(Object.values(PRODUCT_IDS))
			if (!result.products.some(p => known.has(p.identifier))) {
				loadError.value = STORE_UNREACHABLE
				console.warn('In-app purchases: no known products', result.products.map(p => p.identifier))
			}
		} catch (error: any) {
			loadError.value = STORE_UNREACHABLE
			console.warn('In-app purchases unavailable:', error)
		} finally {
			loadingProducts.value = false
		}
	}

	async function purchase(product: PurchasesStoreProduct): Promise<boolean> {
		if (busy.value) return false
		busy.value = true
		message.value = ''
		try {
			const { Purchases } = await getSdk()
			// A plain copy: Vue's reactive Proxy doesn't survive the trip to native code,
			// which then can't recognise the product
			const plainProduct = JSON.parse(JSON.stringify(toRaw(product))) as PurchasesStoreProduct
			const { customerInfo } = await Purchases.purchaseStoreProduct({ product: plainProduct })
			applyCustomerInfo(customerInfo)
			return true
		} catch (error: any) {
			const cancelled = error?.code === '1' || error?.userCancelled
			if (!cancelled) {
				const reason = error?.message || error?.errorMessage || ''
				message.value = `Purchase failed${reason ? ` (${reason})` : ''}. Please try again.`
				console.warn('Purchase failed:', error)
			}
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
			const { Purchases } = await getSdk()
			const { customerInfo } = await Purchases.restorePurchases()
			applyCustomerInfo(customerInfo)
			message.value = isPro.value ? 'Pro restored.' : 'No previous purchases found.'
		} catch (error: any) {
			const reason = error?.message || ''
			message.value = `Restore failed${reason ? ` (${reason})` : ''}. Please try again.`
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
		rewardNote,
		hintBank,
		loadError,
		loadingProducts,

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
