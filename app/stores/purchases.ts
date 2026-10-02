import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import type { CustomerInfo, PurchasesStoreProduct } from '@revenuecat/purchases-capacitor'
import { PRO_ENTITLEMENT, PRODUCT_IDS, TIP_PRODUCT_IDS } from '../utils/appStore'

// Cached so Pro perks still work offline / before RevenueCat answers
const PRO_CACHE_KEY = 'footballdle-pro'

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

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const proProduct = computed(() => products.value.find(p => p.identifier === PRODUCT_IDS.pro))

	const tipProducts = computed(() =>
		TIP_PRODUCT_IDS.map(id => products.value.find(p => p.identifier === id)).filter(
			(p): p is PurchasesStoreProduct => !!p,
		),
	)

	// ============================================================================
	// FUNCTIONS
	// ============================================================================
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
		if (ok) message.value = 'Pro unlocked. Cheers!'
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
		busy,
		message,

		// Computed
		proProduct,
		tipProducts,

		// Functions
		init,
		buyPro,
		tip,
		restore,
	}
})
