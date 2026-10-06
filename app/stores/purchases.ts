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

	async function init() {
		if (isReady.value || !Capacitor.isNativePlatform()) return
		const apiKey = useRuntimeConfig().public.revenuecatAppleKey
		if (!apiKey) return

		try {
			isPro.value = localStorage.getItem(PRO_CACHE_KEY) === '1'
		} catch {}

		try {
			const Purchases = await getSdk()
			await Purchases.configure({ apiKey })
			await Purchases.addCustomerInfoUpdateListener(applyCustomerInfo)
			const { customerInfo } = await Purchases.getCustomerInfo()
			applyCustomerInfo(customerInfo)
			const result = await Purchases.getProducts({ productIdentifiers: Object.values(PRODUCT_IDS) })
			products.value = result.products
			isReady.value = true
		} catch (error) {
			console.warn('In-app purchases unavailable:', error)
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
